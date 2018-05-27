LocationSearch
===

A search component for searching locations via the [Google Places API](https://cloud.google.com/maps-platform/places/).

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

Name | Type | Default | Description
--- | --- | --- | ---
`onPredictionClick` | `func` | `undefined` | Click handler for a search suggestion
`predictionHref` | `string` | `undefined` | If provided, renders `a` instead of `button` for a suggestion

## Related components

* This component is based on SearchCard that is based on [Search](../design/search) component.
