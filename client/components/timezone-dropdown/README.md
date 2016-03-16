Timezone Dropdown
=================

React component for selecting a timezone from a dropdown.

---

```jsx
var TimezoneDropdown = require( 'components/timezone-dropdown' );

module.exports = React.createClass( {

	// ...
	
	onTimezoneSelect( zone ) {
		console.log( `timezone selected: %s`, zone.value );
	},

	render() {
		return (
			<TimezoneDropdown
				selectedZone="Indian/Mahe"
				onSelect={ this.onTimezoneSelect }
			/>
		);
	}

} );
```
## TimezoneDropdown

#### Props

`selectedZone` - **optional** String value to define the selected timezone.

`onSelect` - **optional** Called when user selects a timezone from the
dropdown. An object parameter is passed to the function which has two
properties: `label` usually used to show the selected timezone to the user and
`value` which is the normalized timezone value.
