# WPCOM#Req

## WPCOM.Req.get(params, query, fn)

Make a `GET` request directly to WordPress.com REST-API

```js
// get sites list of current user
wpcom.req.get( '/me/sites', function ( err, data ) {
	// data response
} );
```

## WPCOM.Req.post(params, query, body, fn)

Make a `POST` request directly to WordPress.com REST-API

## WPCOM.Req.put(params, query, body, fn)

It's an alias of `WPCOM.Req.Post()`;

## WPCOM.Req.del(params, query, fn)

It's an alias of `WPCOM.Req.Post()` without passing `body` argument;
