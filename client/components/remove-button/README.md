RemoveButton
=========

This component is used to implement dang sweet remove/trash/delete/disconnect/deactivate buttons.

#### How to use:

```js
var RemoveButton = require( 'components/remove-button' );

render: function() {
	return (
		<RemoveButton compact scary disabled icon={ 'remove | trash | delete | deactivate | disconnect' } >Delete me!</RemoveButton>
	);
}
```

#### Props

* `compact`: (bool) whether the button is compact or not.
* `scary`: (bool) whether the button has modified styling to warn users (red text & icon).
* `disabled`: (bool) whether the button should be in the disabled state.
* `icon`: (string) a text identifier for what kind of button you want to show. Displays `remove` by default. Accepts `remove`, `trash`, `delete`, `disconnect`, `deactivate`.
