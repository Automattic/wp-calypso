Button
=========

This component is used to implement dang sweet buttons.

#### How to use:

```js
var Button = require( 'components/button' );

render: function() {
	return (
		<Button compact primary disabled={ this.props.disabled } >You rock</Button>
	);
}
```

#### Props

* `compact`: (bool) whether the button is compact or not.
* `primary`: (bool) whether the button is styled as a primary button.
* `scary`: (bool) whether the button has modified styling to warn users (delete, remove, etc).
* `href`: (string) if this property is added, it will use an `a` rather than a `button` element.
* `disabled`: (bool) whether the button should be in the disabled state.
