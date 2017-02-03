deterministic-stringify
=======================

This module takes a single parameter and converts it to a namespace representing that parameter. Generally this will be an options object passed into a function, and in particular this is useful for parameters that will be applied to a fetch request.

One important difference between using this module and using node.js's `queystring.stringify()` is that this module is deterministic. Object attributes and arrays are sorted alphabetically. The same output will be returned regardless of the order of attribute names or array items.

This is useful for obtaining a deterministic namespace for query options so that two equivalent queries resolve to the same namespace.

```js
deterministicStringify( true ); // true
deterministicStringify( 1 ); // 1
deterministicStringify( false ); // false
deterministicStringify( null ); // null
deterministicStringify( [ 2, 1, 3 ] ); // 1,2,3
deterministicStringify( [ 1, { a: 1 } ] ); // 1,a=1
deterministicStringify( { a: true } ); // a=true
deterministicStringify( { a: [ 'blah', 'a', 'c' ] } ); // a='a','blah','c'
deterministicStringify( { b: 1, a: [ 'b', 'a' ] } ); // a='a','b'&b=1
deterministicStringify( undefined ); // undefined
```