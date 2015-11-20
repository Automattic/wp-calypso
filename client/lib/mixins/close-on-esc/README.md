Close on ESC
============

A React mixin that calls the component's close method when the ESC key is pressed. This is useful for components such as `Dialog` and `Popover`.

It properly handles stacked components, closing the last component (with close on ESC enabled) to be mounted.

To use this mixin, all you need to do include the mixin in your React component and specify the method name to be called.

```js
var closeOnEsc = require( 'lib/mixins/close-on-esc' );

var MyComponent = React.createClass({
	mixins: [ closeOnEsc( '_close' ) ]
});
```
