WPCOM XHR Wrapper
==========

Provides a wrapper around the `wpcom-xhr-request` library so it returns errors in the same format as `wpcom-proxy-request`.

Specifically this extends the `wpcom-xhr-request` error:

```js
{
	message: 'Bad request',
	status: 400,
	response: {
		body: {
			error: 'blog_name_exists',
			message: 'Sorry, that site already exists'
		}
	}
}
```

With `error` and `statusCode` from `wpcom-proxy-request`, and changes `message` to reflect the error message not the HTTP message.

```js
{
	message: 'Sorry, that site already exists',
	status: 400,
	response: {
		body: {
			error: 'blog_name_exists',
			message: 'Sorry, that site already exists'
		}
	},
	statusCode: 400,
	error: 'blog_name_exists',
	httpMessage: 'Bad request'
}
```

This allows `wpcom-xhr-wrapper` to be used transparently in places where `wpcom-proxy-request` errors are used.
