# Disallow using three dots in translate strings

Three dots for indicating an ellipsis should be replaced with the UTF-8 character … (Horizontal Ellipsis, U+2026) as it has a more semantic meaning.

## Rule Details

The following patterns are considered warnings:

```js
translate( 'Loading...' );
```

The following patterns are not warnings:

```js
translate( 'Loading…' );
```
