Timezone Dropdown
=================

React component for selecting a timezone from a dropdown.

---

```jsx
var TimezoneDropdown = require( 'components/timezone-dropdown' );

module.exports = React.createClass( {

	// ...
	
	onTimezoneSelect( zone ) {
		console.log( `timezone selected: %s`, zone );
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
`onSelect` - **optional** Bound function executed when the timezone is
selected.
