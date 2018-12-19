# Disallow strings which include only placeholders

Strings cannot be translated if they consist only of placeholders.

## Rule Details

The following patterns are considered warnings:

```js
translate( '%s' );
```

The following patterns are not warnings:

```js
translate( 'Hello %s!' );
```
