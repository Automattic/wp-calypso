/** @format */

/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { loadScript } from 'lib/load-script';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import SearchCard from 'components/search-card';

let autocompleteService = null;
const googleMapsKey = 'AIzaSyBO5-y0uPC5DhwrcKy-NHUkLUmFQpNj-1g';

class LocationSearch extends Component {
	static propTypes = {
		onPredictionClick: PropTypes.func,
		predictionHref: PropTypes.string,
	};

	state = { predictions: [] };

	componentDidMount() {
		if ( ! autocompleteService ) {
			autocompleteService = {};
			loadScript(
				`//maps.googleapis.com/maps/api/js?key=${ googleMapsKey }&libraries=places`,
				function() {
					// eslint-disable-next-line no-undef
					autocompleteService = new google.maps.places.AutocompleteService();
				}
			);
		}
	}

	updatePredictions = predictions => {
		this.setState( { predictions } );
	};

	handleSearch = query => {
		this.setState( {
			query: query,
		} );

		if ( query ) {
			autocompleteService.getQueryPredictions( { input: query }, this.updatePredictions );
		} else {
			this.updatePredictions( [] );
		}
	};

	renderPrediction = prediction => {
		const { predictionHref, onPredictionClick } = this.props;

		return (
			<CompactCard
				key={ prediction.place_id }
				href={ predictionHref }
				onClick={ onPredictionClick }
				className="location-search__result"
			>
				<strong>{ prediction.structured_formatting.main_text }</strong>
				<br />
				{ prediction.structured_formatting.secondary_text }
			</CompactCard>
		);
	};

	render() {
		const { predictions } = this.state;

		return (
			<Fragment>
				<SearchCard
					onSearch={ this.handleSearch }
					className="location-search__search-card is-compact"
				/>
				{ predictions && predictions.map( this.renderPrediction ) }
			</Fragment>
		);
	}
}

export default LocationSearch;
