Timezone
========

Select timezone react component.

---

```jsx
var Timezone = require( 'components/timezone' );

module.exports = React.createClass( {

	// ...
	
	onTimezoneSelect( zone ) {
		console.log( `timezone selected: %s`, zone.value );
	},

	render() {
		return (
			<Timezone
				selectedZone="Indian/Mahe"
				onSelect={ this.onTimezoneSelect }
			/>
		);
	}

} );
```
## Timezone

#### Props

`selectedZone` - **optional** String value to define the selected timezone.

`onSelect` - **optional** Called when user selects a timezone from the
select. An object parameter is passed to the function which has two
properties: `label` usually used to show the selected timezone to the user and
`value` which is the normalized timezone value.
