## Testing a view

django-skivvy provides a mixin `ViewTestCase` to add additional helper methods to your test case.

```python
from django.test import TestCase
from skivvy import ViewTestCase

class MyViewTestCase(ViewTestCase, TestCase):
    # your tests here
```

### Testing Django Rest Framework API views

To test instances of [DRF's APIView](http://www.django-rest-framework.org/api-guide/views/), use `APITestCase` instead. It behaves exactly as `ViewTestCase`; the only difference are a few internals in the test setup. 

```python
from django.test import TestCase
from skivvy import APITestCase

class MyViewTestCase(APITestCase, TestCase):
    # your tests here
```

### Getting a response

The method `request` returns a response from your view. The response returned is based on the generic [ configuration](#test-configuration) of the test case. 

To test special cases, you can use `url_kwargs`, `get_data` and `post_data` parameters to temporarily overwrite the generic test setup. 

```python
class MyViewTestCase(ViewTestCase, TestCase):
    def test_a_view(self):
        response =  self.request(method='GET',
                                 user=AnonymousUser(),
                                 url_kwargs={},
                                 get_data={},
                                 post_data={})
```

| Argument      | Type          | Default       | Description   |
| ------------- | ------------- | ------------- | ------------- |
| `method`      | `str`         | `GET`         | HTTP method used for the request|
| `user`        | [`User`](https://docs.djangoproject.com/en/1.9/ref/contrib/auth/#user-model)   | [`AnonymousUser`](https://docs.djangoproject.com/en/1.9/ref/contrib/auth/#django.contrib.auth.models.AnonymousUser) | User authticated with this request. |
| `url_kwargs`  | `dict`        | `{}`          | URL arguments passed to the view.  `ViewTestCase` applies this dictionary to what is defined in `url_kwargs` or `get_url_kwargs`. |
| `get_data`   | `dict`        | `{}`          | Adds query parameters to the request URL. E.g., to test a request to `/some/path/?filter=foo` add `get_data={'filter': 'foo'}`. |
| `post_data`   | `dict`        | `{}`          | Request payload, only relevant for `POST`, `PUT` and `PATCH` requests. `ViewTestCase` applies this dictionary to what is defined in `post_data` or `setup_post_data`. Partial overwrites are allowed. |
| `content_type`   | `str`        | `application/json`          | **Only available for `APITestCase`**. Sets the content type encoding for the request. |

### Evaluating a response

`request` does not return a Django [HTTPResponse](https://docs.djangoproject.com/ja/1.9/ref/request-response/#httpresponse-objects) object. The returned object provides convenient access to important response properties:

| Property      | Type          | Description                      |
| ------------- | ------------- | -------------------------------- |
| `status_code` | `int`         | HTTP status code of the response                                 |
| `content`     | `str`, `dict` | Content of the response. `None` if request results in a redirect. If the response is of type `application/json`, the response will be parsed into a `dict`.|
| `location`    | `str`         | Redirect location. `None` if the request does not result in a redirect. |
| `messages`    | `list`        | A list of all messages added to the session. |
| `headers`     | `dict`        | Dictionary of response headers returned from the view. |

#### Example use

```python
class MyViewTestCase(ViewTestCase, TestCase):
    def test_a_view(self):
        response =  self.request(user=some_user)
        assert response.status_code == 200
        assert response.content == expected_content
```

## Test configuration

django-skivvy's test configuration borrows many ideas from [Django's generic views](https://docs.djangoproject.com/en/1.9/topics/class-based-views/generic-display/). All details of the test configuration can be either set by a constant instance attribute or by overwriting a method, which allows you to add more logic to the test setup. 


### Creating model instances

To create model instances that are required in your test, add the method `setup_models` to the test case.

```python
class MyViewTestCase(ViewTestCase, TestCase):
    def setup_models(self):
        self.project = Project.objects.create(
            name='My Project'
        )
```

### View class

Each test case should only test one view class. To configure the view class, you can use the `view_class` attribute or the `setup_view` method. One of both is required; if both `view_class` and `setup_view`  provided, the method `setup_view` is preferred. 

#### Attribute: `view_class`

```python
from myapp.views import MyView

class MyViewTestCase(ViewTestCase, TestCase):
    view_class = MyView
```

#### Method: `setup_view()`

```python
from myapp.views import MyView

class MyViewTestCase(ViewTestCase, TestCase):
    def setup_view(self):
        return MyView.as_view()
```

### URL arguments

Many URL patterns expect certain keys, which are passed to connected views to identify model instances. These arguments need to be provided to the view in the test case. To configure URL arguments, you can set the attribute `url_kwargs` or implement the method `setup_url_kwargs`. If neither `url_kwargs` or `setup_url_kwargs` are present, an empty `dict` (`{}`) is passed to the view.

#### Attribute: `url_kwargs`

```python
from myapp.views import MyView

class MyViewTestCase(ViewTestCase, TestCase):
    url_kwargs = {
        'project_id': 'abc123'
    }
```

#### Method: `setup_url_kwargs`

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

### URL query parameters

To query parameters to the request URL, you can set the `get_data` attribute or implement `setup_get_data()`. If neither `get_data` or `setup_get_data()` are present, no query parameters will be added.

To add a `search` query parameter

#### Attribute: `get_data`

```python
from myapp.views import MyView

class MyViewTestCase(ViewTestCase, TestCase):
    get_data = {
        'search': 'foo'
    }
```

#### method: `setup_get_data`

```python
class MyViewTestCase(ViewTestCase, TestCase):
    def setup_models(self):
        self.project = Project.objects.create(name='My Project')

    def setup_get_data(self):
        return {
            'search': self.project.name
        }
```

Both `get_data` or `setup_get_data` define default request query parameters for all tests in the test case. Sometimes you might want to test how the view behaves under varying conditions, for instance, if a resource list is filtered correctly. You can overwrite selected query parameters, by providing the optional get_data argument to the request.

```python
class MyViewTestCase(ViewTestCase, TestCase):
    post_data = {
        'name': 'New name'
    }

    def test_invalid_post(self):
        response = self.request(method='GET', get_data={'filter': 'name'})
```

### Request payload

To setup a default request payload for `POST`, `PATCH` or `PUT` request, you can set the `post_data` attribute or implement `setup_post_data()`. If neither `post_data` or `setup_post_data()` are present, the request payload defaults to `{}`. 

#### Attribute: `post_data`

```python
from myapp.views import MyView

class MyViewTestCase(ViewTestCase, TestCase):
    post_data = {
        'name': 'New name'
    }
```

#### method: `setup_post_data`

```python
class MyViewTestCase(ViewTestCase, TestCase):
    def setup_models(self):
        self.project = Project.objects.create(name='My Project')

    def setup_post_data(self):
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

### Viewsets

If the view class you are testing is a [`ViewSet`](http://www.django-rest-framework.org/api-guide/viewsets/), then you have to configure `viewset_actions` in the test case. 

#### Attribute `viewset_actions`

```python
class MyViewTestCase(APITestCase, TestCase):
    view_class = ViewSetInstance
    viewset_actions = {'get': 'list'}
```
