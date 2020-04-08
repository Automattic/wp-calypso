wpcom.js
========

Official JavaScript library for the [WordPress.com][] [REST API][].
Compatible with Node.js and web browsers.

[![CircleCI](https://circleci.com/gh/Automattic/wpcom.js.svg?style=svg)](https://circleci.com/gh/Automattic/wpcom.js)

## How to use

### Node.js

Introduce the `wpcom` dependency into your `package.json` ...

```cli
yarn add wpcom
```

... and then initialize it with your API token ([optional](#authentication)).


```js
// Edit a post on a site
var wpcomXhrRequest = require( 'wpcom-xhr-request' );
var wpcom = require( 'wpcom' )( '<your-token>', wpcomXhrRequest );

wpcom
	.site( 'your-blog.wordpress.com' )
	.postsList( { number: 8 } )
		.then( list => { ... } )
		.catch( error => { ... } );
```

### Client-side code (with a build process)

Introduce the `wpcom` dependency into your `package.json` ...

```cli
npm install --save wpcom
```

... and then initialize it with your API token ([optional](#authentication)).

```js
// Edit a post on a site
import wpcomXhrRequest from 'wpcom-xhr-request';
import wpcomFactory from 'wpcom';

const wpcom = wpcomFactory( '<your-token>', wpcomXhrRequest );

wpcom
	.site( 'your-blog.wordpress.com' )
	.postsList( { number: 8 } )
		.then( list => { ... } )
		.catch( error => { ... } );
```

### Authentication

Not all requests require a REST API token. For example, listing posts on a
public site is something anyone can do.

If you do need a token, here are some links that will help you generate one:
- [OAuth2 Authentication]( https://developer.wordpress.com/docs/oauth2/)
	at WordPress.com Developer Resources
- [`wpcom-oauth-cors`]( https://github.com/Automattic/wpcom-oauth-cors ):
	a client-side WordPress.com OAuth2 library using CORS
- [`wpcom-oauth`]( https://github.com/Automattic/node-wpcom-oauth ):
	a server-side ( Node.js ) WordPress.com OAuth2 library
- If you just want to quickly create a token, the
	[example app bundled with `wpcom-oauth`]( https://github.com/Automattic/node-wpcom-oauth/tree/master/example )
	is probably the easiest way.

## API

* [WPCOM](./docs/wpcom.md )
* [WPCOM#Req](./docs/wpcom.req.md ) - Direct requests to WordPress REST-API
* [Me](./docs/me.md )
* [Site](./docs/site.md )
* [Post](./docs/post.md )
* [Media](./docs/media.md )
* [Users](./docs/users.md )

## Examples

```js
// Edit a post on a site
import wpcomXhrRequest from 'wpcom-xhr-request';
import wpcomFactory from 'wpcom';

const wpcom = wpcomFactory( '<your-token>', wpcomXhrRequest );
const blog = wpcom.site( 'your-blog.wordpress.com' );
blog.post( { slug: 'a-post-slug' } ).update( data )
	.then( res => { ... } )
	.catch( err => { ... } );
```

You can omit the API token for operations that don't require permissions:

```js
// List the last 8 posts on a site
import wpcomXhrRequest from 'wpcom-xhr-request';
import wpcomFactory from 'wpcom';

const wpcom = wpcomFactory( wpcomXhrRequest );
const blog = wpcom.site( 'your-blog.wordpress.com' );
blog.postsList( { number: 8 } )
	.then( list => { ... } )
	.catch( error => { ... } );
```

More pre-made examples are in the [`examples/`](./examples/) directory.

## Test

The `token` and `site` vars must be given to testing scripts either using
`TOKEN` and `SITE` environment vars respectively or through of a
config.json file into `test/` folder like bellow:

```json
{
	"site": "<site-id>",
	"token": "<token>"
}
```

Run tests:

```cli
$ make test-all
```

Also tests can be filtered using `make test FILTER=<filter>`:

```cli
$ make test FILTER=wpcom.site.post
```

## License

MIT – Copyright 2014 Automattic

[Node.js]: http://nodejs.org
[REST API]: http://developer.wordpress.com/docs/api
[WordPress.com]: http://www.wordpress.com
[node-wpcom-oauth]: https://github.com/Automattic/node-wpcom-oauth
