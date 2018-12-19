# Disallow variables as translate strings

Translate strings cannot be variables or functions, but rather must always be string literals. This is a limitation of our translation tooling, as it collects strings through static analysis of the code. The exception to this rule is string concatenation within the argument itself.

This limitation applies to the translatable string itself, as well as the plural form and 'context' and 'comment' options if they are present.

More information: https://github.com/Automattic/i18n-calypso/blob/master/README.md#strings-only

## Rule Details

The following patterns are considered warnings:

```js
translate( myString );

translate( myStringFunc() );
```

The following patterns are not warnings:

```js
translate( 'Hello World!' );

translate( 'Hello' + ' World!' );
```
