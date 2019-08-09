/** @format */

/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { loadScript } from '@automattic/load-script';
import config from 'config';
import { getLocaleSlug } from 'i18n-calypso';
import { identity, noop } from 'lodash';

/**
 * Internal dependencies
 */
import SearchCard from 'components/search-card';
import Search from 'components/search';
import Prediction from './prediction';

/**
 * Style dependencies
 */
import './style.scss';

let autocompleteService = null;
let sessionToken = null;

class LocationSearch extends Component {
	static propTypes = {
		onPredictionClick: PropTypes.func,
		onSearch: PropTypes.func,
		predictionsTransformation: PropTypes.func,
		types: PropTypes.arrayOf( PropTypes.string ),
		hidePredictionsOnClick: PropTypes.bool,
		card: PropTypes.bool,
	};

	static defaultProps = {
		onSearch: noop,
		predictionsTransformation: identity,
		types: [ 'establishment' ],
		hidePredictionsOnClick: false,
		card: true,
	};

	state = {
		loading: false,
		predictions: [],
		query: '',
	};

	componentDidMount() {
		if ( ! autocompleteService ) {
			autocompleteService = {}; // if multiple components are initialized on the page, we'd want the script to load only once
			loadScript(
				`//maps.googleapis.com/maps/api/js?key=${ config(
					'google_maps_and_places_api_key'
				) }&libraries=places`,
				function() {
					// eslint-disable-next-line no-undef
					autocompleteService = new google.maps.places.AutocompleteService();
				}
			);
		}
	}

	updatePredictions = predictions => {
		const { predictionsTransformation } = this.props;
		const { query } = this.state;

		this.setState( {
			predictions: predictionsTransformation( predictions, query ),
			loading: false,
		} );
	};

	handleSearch = query => {
		query = query.trim();
		this.props.onSearch( query );

		this.setState( { loading: true, query }, () => {
			if ( query ) {
				if ( ! sessionToken ) {
					// eslint-disable-next-line no-undef
					sessionToken = new google.maps.places.AutocompleteSessionToken();
				}
				autocompleteService.getPlacePredictions(
					{
						input: query,
						types: this.props.types,
						language: getLocaleSlug(),
						sessionToken,
					},
					this.updatePredictions
				);
			} else {
				this.updatePredictions( [] );
			}
		} );
	};

	handlePredictionClick = prediction => {
		if ( this.props.hidePredictionsOnClick ) {
			this.setState( { predictions: [] } );
		}

		this.props.onPredictionClick( prediction, sessionToken );
		sessionToken = null;
	};

	renderPrediction = prediction => {
		return (
			<Prediction
				key={ prediction.place_id }
				onPredictionClick={ this.handlePredictionClick }
				prediction={ prediction }
			/>
		);
	};

	renderSearchCard( searchProps ) {
		return <SearchCard { ...searchProps } className="location-search__search-card is-compact" />;
	}

	renderSearch( searchProps ) {
		return <Search { ...searchProps } />;
	}

	render() {
		const { predictions } = this.state;
		const searchProps = {
			onSearch: this.handleSearch,
			delaySearch: true,
			delayTimeout: 500,
			disableAutocorrect: true,
			searching: this.props.loading,
		};

		return (
			<Fragment>
				{ this.props.card
					? this.renderSearchCard( searchProps )
					: this.renderSearch( searchProps ) }

				{ predictions && predictions.map( this.renderPrediction ) }
			</Fragment>
		);
	}
}

export default LocationSearch;
