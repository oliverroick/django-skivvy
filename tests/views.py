from django.http import HttpResponse
from django.views.generic import View, TemplateView
from django.contrib import messages
from django.shortcuts import redirect

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.viewsets import GenericViewSet


class GenericView(View):
    test_arg = False

    def get(self, request, *args, **kwargs):
        messages.add_message(request, messages.INFO, 'Hello world.')
        return HttpResponse('<h1>Test content<h1>')

    def post(self, request, *args, **kwargs):
        field, value = request.POST.popitem()
        return HttpResponse('<h1>{}: {}<h1>'.format(field, value))


class GenericTemplateView(TemplateView):
    template_name = 'test.html'

    def get_context_data(self):
        return {'id': 'test-id'}


class CsrfTemplateView(TemplateView):
    template_name = 'csrf.html'


class GenericRedirectView(View):
    test_arg = False

    def get(self, request, *args, **kwargs):
        return redirect('/redirect/')


class APITestView(APIView):
    def get(self, request, *args, **kwargs):
        return Response({"some": "json"})

    def post(self, request, *args, **kwargs):
        post_data = request.data.copy()
        field, value = post_data.popitem()
        return Response({field: value})


class APIXMLTestView(APIView):
    def get(self, request, *args, **kwargs):
        return Response('<some>xml</some>', content_type='application/xml')


class APIViewSetTestView(GenericViewSet):
    def list(self, request, *args, **kwargs):
        return Response({"some": "json"})
