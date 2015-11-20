Button Group
=========

This component is used to group several semantically linked buttons under the same group

#### How to use:

```js
const  ButtonGroup = require( 'components/button-group' ),
	Button = require( 'components/button' );

render: function() {
	return (
		<ButtonGroup>
			<Button compact>Save</Button>
			<Button compact>Cancel</Button>
		</ButtonGroup>
	);
}
```
