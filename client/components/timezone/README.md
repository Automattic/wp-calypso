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

- `id` - _optional_ (string) Value to add an `id=` attribute to the `<select>` element.
- `includeManualOffsets` - _optional_ (boolean) Whether or not to include the manual offsets from the list of timezones. Default value is `true`
- `onSelect` - _optional_ (function) Called when user selects a timezone from the select. An object parameter is passed to the function which has two properties: `label` usually used to show the selected timezone to the user and `value` which is the normalized timezone value.
- `selectedZone` - _optional_ (string) Value to define the selected timezone.
