/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { loadScript } from '@automattic/load-script';
import config from 'config';
import { getLocaleSlug } from 'i18n-calypso';
import { identity, isEmpty, noop } from 'lodash';

/**
 * Internal dependencies
 */
import { CompactCard } from '@automattic/components';
import SearchCard from 'components/search-card';
import Search from 'components/search';
import Prediction from './prediction';
import { Input } from 'my-sites/domains/components/form';

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
		inputType: PropTypes.string,
		inputProps: PropTypes.object,
	};

	static defaultProps = {
		onSearch: noop,
		predictionsTransformation: identity,
		types: [ 'establishment' ],
		hidePredictionsOnClick: false,
		inputType: 'search-card',
		inputProps: {},
		placeholder: 'Search for your address by street or city',
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
				function () {
					// eslint-disable-next-line no-undef
					autocompleteService = new google.maps.places.AutocompleteService();
				}
			);
		}
	}

	updatePredictions = ( predictions ) => {
		const { predictionsTransformation } = this.props;
		const { query } = this.state;

		this.setState( {
			predictions: predictionsTransformation( predictions, query ),
			loading: false,
		} );
	};

	handleSearch = ( query ) => {
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

	handleInputChange( onInputChange ) {
		return ( event ) => {
			onInputChange( event );

			const { value } = event.target;
			this.handleSearch( value );
		};
	}

	handlePredictionClick = ( prediction ) => {
		if ( this.props.hidePredictionsOnClick ) {
			this.setState( { predictions: [] } );
		}

		this.props.onPredictionClick( prediction, sessionToken, this.state.query );
		sessionToken = null;
	};

	renderPrediction = ( prediction ) => {
		return (
			<Prediction
				key={ prediction.place_id }
				onPredictionClick={ this.handlePredictionClick }
				prediction={ prediction }
			/>
		);
	};

	renderInput() {
		const searchProps = {
			onSearch: this.handleSearch,
			delaySearch: true,
			delayTimeout: 500,
			disableAutocorrect: true,
			searching: this.props.loading,
			placeholder: this.props.placeholder,
		};
		const onInputChange = this.props.inputProps.onChange ? this.props.inputProps.onChange : noop;

		switch ( this.props.inputType ) {
			case 'card':
				return <Search { ...searchProps } />;

			case 'input':
				return (
					<Input
						{ ...this.props.inputProps }
						onChange={ this.handleInputChange( onInputChange ) }
						placeholder={ this.props.placeholder }
					/>
				);

			case 'search-card':
			default:
				return (
					<SearchCard { ...searchProps } className="location-search__search-card is-compact" />
				);
		}
	}

	renderPredictions() {
		const { predictions } = this.state;

		return (
			<Fragment>
				{ predictions.map( this.renderPrediction ) }
				<CompactCard className="location-search__attribution">
					<img
						src="https://s1.wp.com/i/powered-by-google-on-white-hdpi.png"
						alt="Powered by Google"
					/>
				</CompactCard>
			</Fragment>
		);
	}

	render() {
		return (
			<Fragment>
				{ this.renderInput() }
				<div className="location-search__predictions">
					{ ! isEmpty( this.state.predictions ) && this.renderPredictions() }
				</div>
			</Fragment>
		);
	}
}

export default LocationSearch;
