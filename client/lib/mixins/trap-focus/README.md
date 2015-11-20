Trap Focus
==========

A React mixin that traps focus in the component. This is useful for components such as `Dialog` and `Popover`.

It properly handles stacked components, trapping focus in the last component (with trapping enabled) to be mounted.

To use this mixin, all you need to do include the mixin in your React component.

```js
var trapFocus = require( 'lib/mixins/trap-focus' );

var MyComponent = React.createClass({
    mixins: [ trapFocus ]
});
```
