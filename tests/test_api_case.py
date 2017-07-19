from unittest.mock import MagicMock
from django.test import TestCase
from django.contrib.auth.models import User
from skivvy import APITestCase

from .views import APITestView, APIXMLTestView, APIViewSetTestView


def test_get_post_data_multipart():
    class TheCase(APITestCase, TestCase):
        post_data = {'some': 'data'}

    case = TheCase()
    post_data = case._get_post_data(content_type='multipart/form-data')
    assert (post_data.decode() == '--BoUnDaRyStRiNg\r\nContent-Disposition: '
                                  'form-data; name="some"\r\n\r\ndata\r\n--'
                                  'BoUnDaRyStRiNg--\r\n')


def test_request_get():
    class TheCase(APITestCase, TestCase):
        view_class = APITestView

    user = User(username='user')
    case = TheCase()
    response = case.request(user=user, get_data={'key': 'value'})

    assert case._request.user == user
    assert case._request.method == 'GET'
    assert case._request.GET.get('key') == 'value'

    assert response.status_code == 200
    assert isinstance(response.content, dict)
    assert response.content == {"some": "json"}
    assert response.location is None
    assert 'content-type' in response.headers
    assert response.headers['content-type'][1] == 'application/json'
    assert len(response.messages) == 0


def test_request_overwrite():
    class TheCase(APITestCase, TestCase):
        view_class = APITestView
        request_meta = {'HTTP_REFERER': 'http://example.com'}

    case = TheCase()
    case.request(
        request_meta={'HTTP_REFERER': 'http://example.com/blah'})

    assert case._request.method == 'GET'
    assert case._request.META['SERVER_NAME'] == 'testserver'
    assert case._request.META['SERVER_PORT'] == '80'
    assert case._request.META['HTTP_REFERER'] == 'http://example.com/blah'


def test_request_post():
    class TheCase(APITestCase, TestCase):
        view_class = APITestView
        post_data = {'some': 'json'}

    user = User(username='user')
    case = TheCase()
    response = case.request(user=user, method='POST')

    assert case._request.user == user
    assert case._request.method == 'POST'

    assert response.status_code == 200
    assert isinstance(response.content, dict)
    assert response.content == {"some": "json"}
    assert response.location is None
    assert 'content-type' in response.headers
    assert response.headers['content-type'][1] == 'application/json'
    assert len(response.messages) == 0


def test_request_post_multipart():
    class TheCase(APITestCase, TestCase):
        view_class = APITestView
        post_data = {'some': 'json'}

    user = User(username='user')
    case = TheCase()
    response = case.request(user=user,
                            method='POST',
                            content_type='multipart/form-data')

    assert case._request.user == user
    assert case._request.method == 'POST'

    assert response.status_code == 200
    assert isinstance(response.content, dict)
    assert response.content == {"some": ["json"]}
    assert response.location is None
    assert 'content-type' in response.headers
    assert response.headers['content-type'][1] == 'application/json'
    assert len(response.messages) == 0


def test_request_get_xml():
    class TheCase(APITestCase, TestCase):
        view_class = APIXMLTestView

    user = User(username='user')
    case = TheCase()
    response = case.request(user=user)

    assert case._request.user == user
    assert case._request.method == 'GET'

    assert response.status_code == 200
    assert isinstance(response.content, str)
    assert response.content == '<some>xml</some>'
    assert response.location is None
    assert 'content-type' in response.headers
    assert response.headers['content-type'][1] == 'application/xml'
    assert len(response.messages) == 0


def test_request_viewset_actions():
    class TheCase(APITestCase, TestCase):
        view_class = APIViewSetTestView
        viewset_actions = {'get': 'list'}

    user = User(username='user')
    case = TheCase()
    response = case.request(user=user)

    assert case._request.user == user
    assert case._request.method == 'GET'

    assert response.status_code == 200
    assert isinstance(response.content, dict)
    assert response.content == {"some": "json"}
    assert response.location is None
    assert 'content-type' in response.headers
    assert response.headers['content-type'][1] == 'application/json'
    assert len(response.messages) == 0


def test_request_overwrite_view_kwargs():
    # default view_kwargs are {'test_arg': False}; by overwriting view_kwargs
    # in request(), setup_view should be called with
    # view_kwargs={'test_arg': True}

    class TheCase(APITestCase, TestCase):
        view_class = APITestView

    case = TheCase()
    case.setup_view = MagicMock()
    case.request(view_kwargs={'test_arg': True})

    case.setup_view.assert_called_with(view_kwargs={'test_arg': True})
