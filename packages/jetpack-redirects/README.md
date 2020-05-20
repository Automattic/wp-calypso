# Jetpack Redirects

A helper function to build URLs using the `jetpack.com/redirect` service.

## Usage

`getRedirectUrl( required source, optional args );`

### $source (required)

Source can be either a “source handler” or a URL.

A “source handler” must be registered in the Jetpack Redirects service, on the server side. It’s a slug that points to an URL that may or may not have dynamic parts in it.

A “URL” is a string that must start with “https://" and doesn’t need to be registered on the server. However, if it is registered, it will point to the URL set as target there rather than to the source. (Note: It will only work for whitelisted domains)

### $args (optional)

This is optional and allows you to pass an array (or object in JS) with more parameters to build the URL:

* **site**: This is used to identify the site and also to fill in the `[site]` placeholder in the target. 

* **path**: Optional. Used to fill in the `[path]` placeholder in the target.

* **query**: Optional. A string with additional variables to be added in the query string. Must be passed as a string in `key=value&foo=bar` format.

* **anchor**: Optional. An anchor to be added to the final URL. Must be a single string. Example: `section1`

## Examples

### Example 1

`getRedirectUrl( 'jetpack', { query: 'foo=bar', anchor: 'section' } );`

This will create: `https://jetpack.com/redirect?source=jetpack&anchor=section&query=foo%3Dbar`

That will point to: `https://jetpack.com/?foo=bar#section`

### Example 2 (placeholders):

```	
getRedirectUrl( 
	'calypso-edit-post',
	{
		path: '1234',
		site: 'example.org'
	}
)
```
This will create: h`ttps://jetpack.com/redirect?site=example.org&source=calypso-edit-post&path=1234`

The calypso-edit-post source points to `https://wordpress.com/post/[site]/[path]`, so the final URL will be:

`https://wordpress.com/post/example.org/1234`
