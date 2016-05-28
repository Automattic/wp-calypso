## Common Test Mocks

Mocks are the commonly used throughout Calypso are put into here.

A mock module defined here must return a function that accept `mockery` as the current `mockery` instance, and registers
itself to mockery. Optionally, it can return the mocked value as well if necessary.

```
const mockDataPoller = require( 'test/helpers/mocks/data-poller' );
const useMockery = require( 'test/helpers/use-mockery' );
describe( 'my-module', function() {
  useMockery( function before() {
    mockDataPoller( mockery );
  } );
} );
```
