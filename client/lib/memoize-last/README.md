# memoize-last

A small utility method to memoize the last invocation of a function, and
return the cached result if a new invocation matches the parameters of the
previous one through a shallow comparison.

Useful when you don't want to maintain an arbitrarily large cache of previous
invocations and are happy just remembering the last one.

## Usage

```
import memoizeLast from 'lib/memoize-last';

function functionToMemoize( a, b, c, d ) {
  // ...
  return result;
}

const memoizedFunction = memoizeLast( functionToMemoize );
```

or simply

```
import memoizeLast from 'lib/memoize-last';

const memoizedFunction = memoizeLast( ( a, b, c, d ) => {
  // ...
  return result;
} );
```
