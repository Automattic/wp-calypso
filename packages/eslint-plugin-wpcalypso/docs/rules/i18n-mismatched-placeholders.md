# Ensure placeholder counts match between singular and plural strings

When using placeholders in strings, there cannot be a mismatch between the number of placeholders in the single and plural variants of the string. Not all languages use the singular form only for a single count. For example, some use the singular form for counts of 21, 31, etc. If there should be a different string for 1 or 0, special case it in the code.

## Rule Details

The following patterns are considered warnings:

```js
var count = 21;
translate( 'One thing', '%d things', {
	count: count,
	args: [ count ]
} );
```

The following patterns are not warnings:

```js
var count = 21;
translate( '%d thing', '%d things', {
	count: count,
	args: [ count ]
} );
```
