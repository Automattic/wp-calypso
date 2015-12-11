Section Header
=========

This component is used to display a header with a label
and optional actions buttons.

## Example Usage:

```js
var SectionHeader = require( 'components/section-header' ),
	Button = require( 'components/button' );

render: function() {
	return (
		<SectionHeader label={ this.translate( 'Team' ) }>
			<Button compact>
				Manage
			</Button>
			<Button
				compact
				onClick={ function() {
					console.log( 'Clicked Add button' );
				} }
			>
				Add
			</Button>
		</SectionHeader>
	);
}
```
## Section Header
This is the base component and acts as a wrapper for a section's (a list of cards) title and any action buttons that act upon that list (like Bulk Edit or Add New Item).

#### Props
- `className` - *optional* (string|object) Classes to be added to the rendered component.
- `label` - *optional* (string) The text to be displayed in the header.
