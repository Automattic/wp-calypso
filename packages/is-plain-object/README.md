# `is-plain-object`

This library exposes a single helper function, `isPlainObject()`.

### `isPlainObject()`

Checks if the provided value is a plain object.

Motivated by Lodash's [`isPlainObject`](https://lodash.com/docs/4.17.15#isPlainObject).

Plain objects are objects that are either:

-   created by the `Object` constructor, or
-   with a `[[Prototype]]` of `null`.

_Parameters_

-   _value_ `*`: Value to check.

_Returns_

-   `boolean`: True when value is considered a plain object.

Example:

```js
import isPlainObject from '@automattic/is-plain-object';

// The following examples will return `true`:
isPlainObject( { foo: 'bar' } );
isPlainObject( Object.prototype );
isPlainObject( Object.create( Object.prototype ) );
isPlainObject( Object.create( null ) );

// The following examples will return `false`:
isPlainObject( undefined )
isPlainObject( null )
isPlainObject( true )
isPlainObject( [ 1, 2, 3 ] )
isPlainObject( '' )
isPlainObject( new Number( 5 ) )
isPlainObject( function () {} )
```
