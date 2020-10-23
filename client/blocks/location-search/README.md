# LocationSearch

A search component for searching locations via the [Google Places API](https://cloud.google.com/maps-platform/places/).

## Usage

```jsx
import LocationSearch from 'calypso/blocks/location-search';
import { createNotice } from 'calypso/state/notices/actions';

class LocationSearchExample extends Component {
	static propTypes = {
		createNotice: PropTypes.func.isRequired,
	};

	handlePredictionClick = ( prediction ) => {
		this.props.createNotice(
			'is-info',
			`You clicked the '${ prediction.structured_formatting.main_text }' location`
		);
	};

	predictionTransformer( predictions, query ) {
		if ( ! query ) {
			return predictions;
		}

		return [
			{
				place_id: 'my_special_place',
				structured_formatting: {
					main_text: query,
					secondary_text: 'Create a business with this name',
				},
			},
			...( predictions || [] ),
		];
	}

	render() {
		return (
			<LocationSearch
				onPredictionClick={ this.handlePredictionClick }
				predictionsTransformation={ this.predictionTransformer }
			/>
		);
	}
}
```

### Props

| Name                        | Type   | Default                      | Description                                                                                                                                                                   |
| --------------------------- | ------ | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `onPredictionClick`         | `func` | `undefined`                  | Click handler for a search suggestion                                                                                                                                         |
| `predictionsTransformation` | `func` | `predictions => predictions` | A transformation function that takes `predictions` and `query` and returns predictions, for example if you'd like to add additional virtual predictions. ( see example code ) |

## Related components

- This component is based on SearchCard that is based on [Search](../design/search) component.
