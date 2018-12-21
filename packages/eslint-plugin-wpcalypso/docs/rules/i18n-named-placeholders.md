# Disallow multiple unnamed placeholders

Translators need to be able to change the order of strings, so multiple placeholders in a translation should be named.

## Rule Details

The following patterns are considered warnings:

```js
translate( '%s %s', {
	args: [ 'Hello', 'World' ]
} );
```

The following patterns are not warnings:

```js
translate( '%(greeting)s %(toWhom)s', {
	args: {
		greeting: 'Hello',
		toWhom: 'World'
	}
} );
```
