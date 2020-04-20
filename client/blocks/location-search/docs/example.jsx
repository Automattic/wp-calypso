/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import LocationSearch from 'blocks/location-search';
import { createNotice } from 'state/notices/actions';

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

const ConnectedLocationSearchExample = connect( null, { createNotice } )( LocationSearchExample );
ConnectedLocationSearchExample.displayName = 'LocationSearch';
export default ConnectedLocationSearchExample;
