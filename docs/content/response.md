## Evaluating response content

To evaluate the response's content, ViewTestCase provides the property `expected_content` that you can use in the test's assertions.

```python
class MyViewTestCase(ViewTestCase, TestCase):
    def test_correct_content(self):
        response = self.request(method='GET')
        assert response.status_code == 200
        assert response.content == self.expected_content
```

`expected_content` can be configured by providing a template name and a template context.

### Configuring template name

To configure the template name you can set the attribute `template` or implement the method `setup_template` of you need more logic. Either `template` or `setup_template()` are required; if both are present `setup_template()` will be prefered. 

#### Attribute: `template`

```python
class MyViewTestCase(ViewTestCase, TestCase):
    template = 'projects/project_detail.html'
```

#### method: `setup_template`

```python
class MyViewTestCase(ViewTestCase, TestCase):
    def setup_template(self):
        return 'projects/project_detail.html'
```

### Configuring template context

To configure the template context, you can provide a static context using the `template_context` or implement `setup_template_context()`. If neither `template_context` or `setup_template_context()` are present the template context used defaults to `{}`; if both are present `setup_template_context()` will be prefered. 

##### Attribute: `template_context`

```python
class MyViewTestCase(ViewTestCase, TestCase):
    template_context = {
        'object_id': 'abc123'
    }
```

#### Method: `setup_template_context`

```python
class MyViewTestCase(ViewTestCase, TestCase):
    def setup_models(self):
        self.project = Project.objects.create(name='My Project')

    def setup_template_context(self):
        form = MyForm(instance=self.project)
        return {
            'object': self.project,
            'form': form
        }
```

### Overwriting the template context

The combination of template and template context defines the default expected response for all tests in the test case. In some cases, you want to test if the template is rendered with an alternative context, for instance, if a form renders the error messages correctly. `expected_content` uses the method `render_content` internally. You can use the same method to render alternative views of the template by updating the default context with new values. `render_content()` allows to add an arbitrary number of keyword arguments, which update the default context.

```python
class MyViewTestCase(ViewTestCase, TestCase):
    template = 'project_form.html'
    post_data = {
        'name': 'New name'
    }

    def setup_models(self):
        self.project = Project.objects.create(name='My Project')

    def setup_template_context(self):
        form = MyForm(instance=self.project)
        return {
            'object': self.project,
            'form': form
        }

    def test_invalid_post(self):
        invalid_data = {'name': 'invalid name'}
        invalid_form = MyForm(instance=self.project, data=invalid_data)
        expected_response = self.render_content(form=invalid_form)

        response = self.request(method='POST', post_data=invalid_data)
        assert response.status_code == 200
        assert response.content == expected_response
```

### Removing CSRF tokens from the response

Since version 1.10, Django changes the CSRF token on each request. If you render a template twice the CSRF token changes and comparing both results will fail. 

django-skivvy removes all CRSF tokens from rendered response automatically. If you have a special case where you render a template without using django-skivvy, you can use `remove_csrf` to remove the token from the response.

```python
from skivvy import remove_csrf

class MyViewTestCase(ViewTestCase, TestCase):
    def test_view(self):
        response_html = self.get_some_rendered_response()
        no_csrf = remove_csrf(response_html)

```
