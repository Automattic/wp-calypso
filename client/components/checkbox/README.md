Checkbox
=========

This component is used to implement some nifty checkboxes.

#### How to use:

```js
var Checkbox = require( 'components/checkbox' );

render: function() {
	return (
		<Checkbox compact primary disabled={ this.props.disabled } />
	);
}
```

#### Props

* `checked`: (bool) whether the checkbox should be in the checked state.
* `disabled`: (bool) whether the checkbox should be in the disabled state.
