LocationSearch
===

A search component for searching locations via the Google Places API.

## Usage

```jsx
import LocationSearch from 'blocks/location-search';

export default function AwesomeLocationSearch() {
	return (
		<LocationSearch />
	);
}
```

### Props

Props are displayed as a table with Name, Type, Default, and Description as headings.

**Required props are marked with `*`.**

Name | Type | Default | Description
--- | --- | --- | ---
`onPredictionClick` | `func` | `undefined` | Click handler for a search suggestion
`predictionHref` | `string` | `undefined` | If provided, renders `a` instead of `button` for a suggestion


## Related components

* This component is based on SearchCard that is based on [Search](../design/search) component.
