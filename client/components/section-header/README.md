Section Header
=========

This component is used to display a header with a label
and optional actions buttons.

## Example Usage:

```js
var SectionHeader = require( 'components/section-header' ),
	SectionHeaderButton = require( 'components/section-header/button' );

render: function() {
	return (
		<SectionHeader label={ this.translate( 'Team' ) }>
			<SectionHeaderButton>Manage</SectionHeaderButton>
			<SectionHeaderButton onClick={ function() {
				console.log( 'Clicked Add button' );
			} }>
				{ this.translate( 'Add' ) }
			</SectionHeaderButton>
		</SectionHeader>
	);
}
```
## Section Header
This is the base component and acts as a wrapper for
the People Section Header Buttons.

#### Props
- `className` - *optional* (string|object) Classes to be added to the rendered component.
- `label` - *optional* (string) The text to be displayed in the header.

## People Section Header Button
This component acts as a wrapper around the `button` component and 
forces the `section-header__button` class be rendered. This component, 
when passed as a child to `SectionHeader`, is rendered as 
an action button on the right hand side of the header.
