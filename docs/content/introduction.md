## django-skivvy

Testing views for Django involves a lot of repetitive code. Each test case evaluates similar cases:

- Accessing the view with an authorized user and returning the correct response content and status.
- Accessing the view with an unauthorized user and return the right response content and status.
- Accessing the view with an unauthenticated user and redirecting to the login page.
- Accessing an object, which is not found in the database and returning a 404 error.
- Posting a valid payload.
- Posting an invalid payload.

Many of these cases need to be set up in similar ways. The test client needs to call the URL with specified parameters, the user needs to be logged in, an expected response needs to be rendered with a given template and template context and evaluated. 

Using the Django built-in test client is very slow. So we have been experimenting with alternative approaches to testing views. Our approach, however, involves even more repetitive boilerplate code. Views need to be initialized with parameters to identify objects in the database; users need to be assigned, templates need to be rendered with specific template contexts, etc., etc.

django-skivvy is a mini test framework that addresses the problems and that helps you write better and more readable tests for Django views. You can focus on parametrizing your tests, while django-skivvy takes care of running the tests. 
