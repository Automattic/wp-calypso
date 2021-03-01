# Timezone

Select timezone react component.

---

```jsx
import Timezone from 'calypso/components/timezone';

export default class extends React.Component {
	// ...

	onTimezoneSelect = ( zone ) => {
		console.log( `timezone selected: %s`, zone.value );
	};

	render() {
		return <Timezone selectedZone="Indian/Mahe" onSelect={ this.onTimezoneSelect } />;
	}
}
```

## Props

`selectedZone` - **optional** String value to define the selected timezone.

`includeManualOffsets` - **optional** Boolean value to include/exclude the manual offsets from the
list of timezones, the default value is `true`

`onSelect` - **optional** Called when user selects a timezone from the
select. An object parameter is passed to the function which has two
properties: `label` usually used to show the selected timezone to the user and
`value` which is the normalized timezone value.
