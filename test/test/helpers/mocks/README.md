## Common Test Mocks

Mocks are the commonly used throughout Calypso are put into here.

A mock module defined here *must* have `before` and `after` functions defined, which register and deregister themselves
 through mockery. Both functions should expect to be called with one argument, `mockery`, instance.

Since mocha runs `before` and `after` hooks FIFO order, the registering and deregistering must be made explicitly by the
test itself. E.g.

```
const mockComponentClasses = require( 'test/helpers/mocks/component-classes' );
const mockery = require( 'mockery' );
describe( 'my-module', function() {
  before( function() {
  	mockComponentClasses.before( mockery );
  } );
  after( function() {
  	mockComponentClasses.after( mockery );
  } );
} );
```
