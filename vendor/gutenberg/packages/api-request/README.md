# @wordpress/api-request

Wrapper around `jQuery.ajax` to call WordPress REST APIs.

## Installation

Install the module

```bash
npm install @wordpress/api-request --save
```

## Usage

```js
import apiRequest from '@wordpress/api-request';

apiRequest( { path: '/wp/v2/posts' } ).then( posts => {
	console.log( posts );
} );
```

### Middlewares

the `api-request` package supports middlewares. Middlewares are functions you can use to wrap the `wp.apiRequest` calls to perform any pre/post process to the API requests.

**Example**

```js
wp.apiRequest.use( ( options, next ) => {
	const start = Date.now();
	const result = next( options );
	result.then( () => {
		console.log( 'The request took ' + Date.now() - start );
	} );
	return result;
} );
```

The apiRequest package provides built-in middlewares you can use to provide a `nonce` and a custom `rootURL`.

<br/><br/><p align="center"><img src="https://s.w.org/style/images/codeispoetry.png?1" alt="Code is Poetry." /></p>
