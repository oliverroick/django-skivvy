import json
import io
from collections import namedtuple
from django.core.exceptions import ImproperlyConfigured
from django.http import HttpRequest
from django.contrib.auth.models import AnonymousUser
from django.contrib.messages.storage.fallback import FallbackStorage
from django.template.loader import render_to_string
from django.core.urlresolvers import reverse
from django.contrib.messages.api import get_messages
from django.test.client import encode_multipart

__version__ = '0.1.0'
Response = namedtuple('Response',
                      'status_code content location messages headers')


class ViewTestCase:
    def setUp(self):
        super().setUp()

        if hasattr(self, 'setup_models'):
            self.setup_models()

    def request(self, method='GET', user=AnonymousUser(), url_kwargs={},
                post_data={}, get_data={}, view_kwargs={}):
        self._request = HttpRequest()
        setattr(self._request, 'method', method)
        setattr(self._request, 'user', user)

        setattr(self._request, 'session', 'session')
        self.messages = FallbackStorage(self._request)
        setattr(self._request, '_messages', self.messages)

        setattr(self._request, 'GET', self._get_get_data(get_data))

        if method in ['POST', 'PATCH', 'PUT']:
            post_data = self._get_post_data(post_data)
            setattr(self._request, method, post_data)

        url_params = self._get_url_kwargs(url_kwargs)
        view = self.setup_view(view_kwargs=view_kwargs)

        response = view(self._request, **url_params)

        content = None
        if response.status_code == 200 and hasattr(response, 'render'):
            content = response.render().content.decode('utf-8')

        return Response(
            status_code=response.status_code,
            content=content,
            location=response.get('location', None),
            messages=[str(m) for m in get_messages(self._request)],
            headers=response._headers
        )

    def setup_view(self, view_kwargs={}):
        if not hasattr(self, 'view_class'):
            raise ImproperlyConfigured(
                "ViewTestCase requires either a definition of "
                "'view_class' or an implementation of 'setup_view()'")

        if hasattr(self, 'viewset_actions'):
            return self.view_class.as_view(self.viewset_actions, **view_kwargs)
        else:
            return self.view_class.as_view(**view_kwargs)

    def _get_get_data(self, data):
        get_data = {}
        if hasattr(self, 'setup_get_data'):
            get_data = self.setup_get_data()
        elif hasattr(self, 'get_data'):
            get_data = self.get_data.copy()

        get_data.update(data)
        return get_data

    def _get_post_data(self, data):
        post_data = {}
        if hasattr(self, 'setup_post_data'):
            post_data = self.setup_post_data()
        elif hasattr(self, 'post_data'):
            post_data = self.post_data.copy()

        post_data.update(data)
        return post_data

    def _get_url_kwargs(self, add_args={}):
        url_kwargs = {}
        if hasattr(self, 'setup_url_kwargs'):
            url_kwargs = self.setup_url_kwargs()
        elif hasattr(self, 'url_kwargs'):
            url_kwargs = self.url_kwargs.copy()

        url_kwargs.update(add_args)
        return url_kwargs

    def _get_template(self):
        if hasattr(self, 'setup_template'):
            return self.setup_template_context()
        elif hasattr(self, 'template'):
            return self.template
        else:
            raise ImproperlyConfigured(
                "ViewTestCase requires either a definition of "
                "'template' or an implementation of 'setup_template()'")

    def _get_template_context(self):
        if hasattr(self, 'setup_template_context'):
            return self.setup_template_context()
        elif hasattr(self, 'template_context'):
            return self.template_context
        else:
            return {}

    def render_content(self, **context_kwargs):
        template = self._get_template()
        context = self._get_template_context()
        context.update(context_kwargs)

        return render_to_string(template, context, request=self._request)

    @property
    def expected_content(self):
        return self.render_content()

    def _get_success_url_kwargs(self):
        if hasattr(self, 'setup_success_url_kwargs'):
            return self.setup_success_url_kwargs()
        elif hasattr(self, 'success_url_kwargs'):
            return self.success_url_kwargs
        else:
            return self._get_url_kwargs()

    def get_success_url(self):
        if hasattr(self, 'success_url'):
            return self.success_url
        elif hasattr(self, 'success_url_name'):
            url_kwargs = self._get_success_url_kwargs()

            return reverse(self.success_url_name, kwargs=url_kwargs)
        else:
            raise ImproperlyConfigured(
                "ViewTestCase requires either a definition of "
                "'success_url', 'success_url_name' or an implementation of "
                "'get_success_url()'")

    @property
    def expected_success_url(self):
        return self.get_success_url()


class APITestCase(ViewTestCase):
    def request(self, method='GET', user=AnonymousUser(), url_kwargs={},
                post_data={}, get_data={}, content_type='application/json'):
        self._request = HttpRequest()
        setattr(self._request, 'method', method)
        setattr(self._request, '_force_auth_user', user)
        self._request.META['SERVER_NAME'] = 'testserver'
        self._request.META['SERVER_PORT'] = '80'

        url_params = self._get_url_kwargs(url_kwargs)
        view = self.setup_view()

        setattr(self._request, 'GET', self._get_get_data(get_data))

        if method in ['POST', 'PATCH', 'PUT']:
            post_data = self._get_post_data(post_data)

            if content_type == 'multipart/form-data':
                content_type = 'multipart/form-data; boundary=BoUnDaRyStRiNg'
                post_data = encode_multipart('BoUnDaRyStRiNg', post_data)

            else:
                post_data = json.dumps(post_data).encode()

            self._request.META['CONTENT_LENGTH'] = len(post_data)
            self._request.META['CONTENT_TYPE'] = content_type
            setattr(self._request, '_stream', io.BytesIO(post_data))

        response = view(self._request, **url_params)
        content = response.render().content.decode('utf-8')
        if 'application/json' in response._headers.get('content-type', ()):
            content = json.loads(content)
        elif 'application/xml' in response._headers.get('content-type', ()):
            content = response.data

        return Response(
            status_code=response.status_code,
            content=content,
            location=response.get('location', None),
            messages=[str(m) for m in get_messages(self._request)],
            headers=response._headers
        )
