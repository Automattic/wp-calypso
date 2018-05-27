/** @format */

/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { loadScript } from 'lib/load-script';
import config from 'config';

/**
 * Internal dependencies
 */
import SearchCard from 'components/search-card';
import Prediction from './prediction';

let autocompleteService = null;

class LocationSearch extends Component {
	static propTypes = {
		onPredictionClick: PropTypes.func,
	};

	state = { predictions: [], loading: false };

	componentDidMount() {
		if ( ! autocompleteService ) {
			autocompleteService = {}; // if multiple components are initialized on the page, we'd want the script to load only once
			loadScript(
				`//maps.googleapis.com/maps/api/js?key=${ config(
					'google_maps_api_key'
				) }&libraries=places`,
				function() {
					// eslint-disable-next-line no-undef
					autocompleteService = new google.maps.places.AutocompleteService();
				}
			);
		}
	}

	updatePredictions = predictions => {
		this.setState( { predictions, loading: false } );
	};

	handleSearch = query => {
		if ( query ) {
			this.setState( { loading: true } );
			autocompleteService.getPlacePredictions(
				{
					input: query,
					types: [ 'establishment' ],
				},
				this.updatePredictions
			);
		} else {
			this.updatePredictions( [] );
		}
	};

	renderPrediction = prediction => {
		const { onPredictionClick } = this.props;

		return (
			<Prediction
				key={ prediction.place_id }
				onPredictionClick={ onPredictionClick }
				prediction={ prediction }
			/>
		);
	};

	render() {
		const { predictions, loading } = this.state;

		return (
			<Fragment>
				<SearchCard
					onSearch={ this.handleSearch }
					delaySearch={ true }
					delayTimeout={ 500 }
					disableAutocorrect={ true }
					searching={ loading }
					className="location-search__search-card is-compact"
				/>
				{ predictions && predictions.map( this.renderPrediction ) }
			</Fragment>
		);
	}
}

export default LocationSearch;
