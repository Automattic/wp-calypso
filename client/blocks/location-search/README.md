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
`predictionsTransformation` | `func` | `predictions => predictions` | A transformation function that takes `predictions` and `query` and returns predictions, for example if you'd like to add additional virtual predictions. ( see example code )

## Related components

* This component is based on SearchCard that is based on [Search](../design/search) component.
