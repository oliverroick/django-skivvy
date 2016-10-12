from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'^success/(?P<id>[-\w]+)/$', views.GenericView, name='success'),
]
