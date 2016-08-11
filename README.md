# django-skivvy

django-skivvy helps you write better and more readable tests for Django views.

## Rationale

Testing views for Django involves a lot of repetitive code. Each test case evaluates similar case:

- Accessing the view with an authorized user and returning the correct response content.
- Accessing the view with an unauthorized user and return the right response content.
- Accessing the view with an unauthenticated user and redirecting to the login page.
- Accessing an object, which is not found in the database and returning a 404 error.
- Posting a valid payload.
- Posting an invalid payload.

Many of these cases need to be set up in similar ways. The test client needs to call the URL with specified parameters, the user needs to be logged in, an expected response needs to be rendered and evaluated. 

Using the Django built-in test client is very slow. So we have been experimenting alternative approaches to testing views. Our approach, however, involves even more repetitive boilerplate code. Views need to be initialized with parameters to identify objects in the database; users need to be assigned, templates need to be rendered with specific template contexts, etc., etc.

django-skivvy is a mini test framework that addresses the problems. You can focus on parametrizing your tests, while django-skivvy takes care about running the tests. 


## Usage

django-skivvy provides a mixin `ViewTestCase` to add additional helper methods to your test case.

```python
from django.test import TestCase
from skivvy import ViewTestCase

class MyViewTestCase(ViewTestCase, TestCase):
    # your tests here
```

### Testing a view

#### Getting a response

The method `request` returns a response from your view. The response returned is both based on the generic setup in the test case as well as the additional parameters you provide with `request`.

```pyhton
response(method='GET', user=AnonymousUser(), url_kwargs={}, data={}) 
```

| Argument      | Type          | Default       | Description   |
| ------------- | ------------- | ------------- | ------------- |
| `method`      | `str`         | `GET`         | HTTP method used for the request|
| `user`        | [`User`](https://docs.djangoproject.com/en/1.9/ref/contrib/auth/#user-model)   | [`AnonymousUser`](https://docs.djangoproject.com/en/1.9/ref/contrib/auth/#django.contrib.auth.models.AnonymousUser) | User authticated with this request. |
| `url_kwargs`  | `dict`        | `{}`          | URL arguments passed to the view.  `ViewTestCase` applies this dictionary to what is defined in `url_kwargs` or `get_url_kwargs`. |
| `data`        | `dict`        | `{}`          | Request payload, only relevant for `POST`, `PUT` and `PATCH` requests. `ViewTestCase` applies this dictionary to what is defined in `post_data` or `setup_post_data`. Partial overwrites are allowed. |

#### Evaluating a response

`request` does not return a Django [HTTPResponse](https://docs.djangoproject.com/ja/1.9/ref/request-response/#httpresponse-objects) object. The returned object provides convenient access to important response properties:

| Property      | Type          | Description                      |
| ------------- | ------------- | -------------------------------- |
| `status_code` | `int`         | HTTP status code of the response                                 |
| `content`     | `str`         | Content of the response. `None` if request results in a redirect. |
| `location`    | `str`         | Redirect location. `None` if the request does not result in a redirect. |
| `messages`    | `list`        | A list of all messages added to the session. |

### Test configuration

django-skivvy's test configuration borrows many ideas from Django's generic views. All details of the test configuration can be either set by a constant instance attribute or by overwriting a method, which allows you to add more logic to the test setup. To configure the test you can set the following properties:

- Model instances
- View class
- URL arguments, which are passed to the view
- Request payload for `POST`, `PUT` and `PATCH` requests.
- Success redirect URLs

#### Creating model instances

To create model instances that are required in your test, add the method `setup_models` to the test case.

```python
class MyViewTestCase(ViewTestCase, TestCase):
    def setup_models(self):
        self.project = Project.objects.create(name='My Project')
```

#### View class

Each test case should only test one view class. To configure the view class, you can use the `view_class` attribute or the `setup_view` method. One of both is required; if both `view_class` and `setup_view`  provided, the method `setup_view` is preferred. 

##### Attribute: `view_class`

```python
from myapp.views import MyView

class MyViewTestCase(ViewTestCase, TestCase):
    view_class = MyView
```

##### Method: `setup_view()`

```python
from myapp.views import MyView

class MyViewTestCase(ViewTestCase, TestCase):
    def setup_view(self):
        return MyView.as_view()
```

#### URL arguments

Many URL patterns expect certain keys, which are passed to connected views to identify model instances. These arguments need to be provided to the view in the test case. To configure URL arguments, you can set the attribute `url_kwargs` or implement the method `setup_url_kwargs`. If neither `url_kwargs` or `setup_url_kwargs` are present and empty `dict` (`{}`) is passed to the view.

##### Attribute: `url_kwargs`

```python
from myapp.views import MyView

class MyViewTestCase(ViewTestCase, TestCase):
    url_kwargs = {
        'project_id': 'abc123'
    }
```

##### Method: `setup_url_kwargs`

```python
class MyViewTestCase(ViewTestCase, TestCase):
    def setup_models(self):
        self.project = Project.objects.create(name='My Project')

    def setup_url_kwargs(self):
        return {
            'project_id': self.project.id
        }
```

Both `url_kwargs` or `setup_url_kwargs` define default URL arguments for all tests in the test case. Sometimes you might want to test how the view behaves under varying conditions, for instance when you want to test that a `404` error is returned when a model instance cannot be found in the database. You can overwrite individual URL keys in the `request` method, by providing the optional `url_kwargs` argument:

```python
from myapp.views import MyView

class MyViewTestCase(ViewTestCase, TestCase):
    url_kwargs = {
        'project_id': 'abc123'
    }

    def test_not_found(self):
        response = self.request(url_kwargs={'project_id': 'def456'})
```

If you have several URL arguments, and you want to overwrite only some of them, it's sufficient only to provide the keys you want to change. django-skivvy merges those with the default URL arguments. 

#### Request payload

To setup a default request payload for `POST`, `PATCH` or `PUT` request, you can set the `post_data` attribute or implement `setup_post_data()`. If neither `post_data` or `setup_post_data()` are present, the request payload defaults to `{}`. 

##### Attribute: `post_data`

```python
from myapp.views import MyView

class MyViewTestCase(ViewTestCase, TestCase):
    post_data = {
        'name': 'New name'
    }
```

##### method: `setup_post_data`

```python
class MyViewTestCase(ViewTestCase, TestCase):
    def setup_models(self):
        self.project = Project.objects.create(name='My Project')

    def setup_url_kwargs(self):
        return {
            'name': self.project.name + ' #1'
        }
```

Both `post_data` or `setup_post_data` define default request payloads for all tests in the test case. Sometimes you might want to test how the view behaves under varying conditions, for instance, that an invalid payload is handled correctly. You can overwrite parts of the request payload in the `request` method, by providing the optional `post_data` argument:

```python
class MyViewTestCase(ViewTestCase, TestCase):
    post_data = {
        'name': 'New name'
    }

    def test_invalid_post(self):
        response = self.request(method='POST', post_data={'name': 'Invalid name'})
```

### Success redirects

When a view redirects to a different location after a request, you can test that too. It is, for example, common to redirect to an object's detail page after an object is created or updated, or to redirect to the login page, when a login is required. `ViewTestCase` provides the property `expected_success_url` that you can use in the test's assertions. 

```python
class MyViewTestCase(ViewTestCase, TestCase):
    def test_correct_redirect(self):
        response = self.request(method='POST', post_data={'name': 'Project name'})
        assert response.status_code == 302
        assert response.location == self.expected_success_url
```

There are different ways to configure what is returned from `expected_success_url`. 

##### Attribute: `success_url`

Use this to define a static success URL.

```python
class MyViewTestCase(ViewTestCase, TestCase):
    success_url = '/path/to/project-name/'
```

##### URL name and URL arguments

To generate the `expected_success_url`, django-skivvy uses Django's [`reverse` function](https://docs.djangoproject.com/en/1.9/ref/urlresolvers/#reverse). You have to provide the URL name and URL arguments to generate the success URL. 

The URL name can be defined via the `success_url_name` attribute. The URL arguments can be provided by the static `success_url_kwargs` attribute or by implementing the method `setup_success_url_kwargs` if you need to apply more logic.


```python
class MyViewTestCase(ViewTestCase, TestCase):
    success_url_name = 'project-detail'
    success_url_kwargs = {
        'project_id': 'abc123'
    }
```

```python
class MyViewTestCase(ViewTestCase, TestCase):
    success_url_name = 'project-detail'

    def setup_success_url_kwargs(self):
        return {
            'project_id': self.project.id
        }
```

Finally, overwriting the method `get_success_url()` provides the most flexibility. 

```python
class MyViewTestCase(ViewTestCase, TestCase):
    def get_success_url(self):
        return '/path/to/project-name/'
```

### Evaluating response content

To evaluate the response's content, ViewTestCase provides the property `expected_content` that you can use in the test's assertions.

```python
class MyViewTestCase(ViewTestCase, TestCase):
    def test_correct_content(self):
        response = self.request(method='GET')
        assert response.status_code == 200
        assert response.content == self.expected_content
```

`expected_content` can be configured by providing a template name and a template context.

#### Configuring template name

To configure the template name you can set the attribute `template` or implement the method `setup_template` of you need more logic. Either `template` or `setup_template()` are required; if both are present `setup_template()` will be prefered. 

##### Attribute: `template`

```python
class MyViewTestCase(ViewTestCase, TestCase):
    template = 'projects/project_detail.html'
```

##### method: `setup_template`

```python
class MyViewTestCase(ViewTestCase, TestCase):
    def setup_template(self):
        return 'projects/project_detail.html'
```

#### Configuring template context

To configure the template context, you can provide a static context using the `template_context` or implement `setup_template_context()`. If neither `template_context` or `setup_template_context()` are present the template context used defaults to `{}`; if both are present `setup_template_context()` will be prefered. 

##### Attribute: `template_context`

```python
class MyViewTestCase(ViewTestCase, TestCase):
    template_context = {
        'object_id': 'abc123'
    }
```

##### Method: `setup_template_context`

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
