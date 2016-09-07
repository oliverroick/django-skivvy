## Evaluating redirects

When a view redirects to a different location after a request, you can test that too. It is, for example, common to redirect to an object's detail page after an object is created or updated, or to redirect to the login page, when a login is required. 

### `expected_success_url`

`ViewTestCase` provides the property `expected_success_url` that you can use in the test's assertions. 

```python
class MyViewTestCase(ViewTestCase, TestCase):
    def test_correct_redirect(self):
        response = self.request(method='POST', post_data={'name': 'Project name'})
        assert response.status_code == 302
        assert response.location == self.expected_success_url
```

There are different ways to configure what is returned from `expected_success_url`. 

### Static `success_url`

#### Attribute: `success_url`

Use this to define a static success URL.

```python
class MyViewTestCase(ViewTestCase, TestCase):
    success_url = '/path/to/project-name/'
```

### URL name and URL arguments

To generate the `expected_success_url`, django-skivvy uses Django's [`reverse` function](https://docs.djangoproject.com/en/1.9/ref/urlresolvers/#reverse). You have to provide the URL name and URL arguments to generate the success URL. 

The URL name can be defined via the `success_url_name` attribute. The URL arguments can be provided by the static `success_url_kwargs` attribute or by implementing the method `setup_success_url_kwargs` if you need to apply more logic.

#### Attribute `success_url_kwargs`

```python
class MyViewTestCase(ViewTestCase, TestCase):
    success_url_name = 'project-detail'
    success_url_kwargs = {
        'project_id': 'abc123'
    }
```

#### Method `setup_success_url_kwargs`

```python
class MyViewTestCase(ViewTestCase, TestCase):
    success_url_name = 'project-detail'

    def setup_success_url_kwargs(self):
        return {
            'project_id': self.project.id
        }
```

### Overwriting `get_success_url()`

Finally, overwriting the method `get_success_url()` provides the most flexibility. 

#### Method `get_success_url()`

```python
class MyViewTestCase(ViewTestCase, TestCase):
    def get_success_url(self):
        return '/path/to/project-name/'
```
