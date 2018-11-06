/** @format */

/**
 * External dependencies
 */

import { __ } from '@wordpress/i18n';
import { Component, createRef } from '@wordpress/element';
import { BaseControl, TextControl } from '@wordpress/components';

/**
 * Internal dependencies
 */

import Lookup from '../lookup';

const placeholderText = __( 'Add a marker...', 'jetpack' );

export class LocationSearch extends Component {
	constructor() {
		super( ...arguments );

		this.textRef = createRef();
		this.containerRef = createRef();
		this.state = {
			isEmpty: true,
		};
		const { map_service } = this.props;
		this.autocompleter = this.autocompleterForService( map_service );
	}
	autocompleterForService = map_service => {
		switch ( map_service ) {
			case 'googlemaps':
				return {
					name: 'placeSearch',
					options: this.searchGoogle,
					isDebounced: true,
					getOptionLabel: option => <span>{ option.description }</span>,
					getOptionKeywords: option => [ option.description ],
					getOptionCompletion: this.getOptionCompletionGoogle,
				};
			case 'mapbox':
				return {
					name: 'placeSearch',
					options: this.searchMapbox,
					isDebounced: true,
					getOptionLabel: option => <span>{ option.place_name }</span>,
					getOptionKeywords: option => [ option.place_name ],
					getOptionCompletion: this.getOptionCompletionMapbox,
				};
		}
	};
	componentDidUpdate() {
		const { map_service } = this.props;
		this.autocompleter = this.autocompleterForService( map_service );
	}
	componentDidMount() {
		setTimeout( () => {
			this.containerRef.current.querySelector( 'input' ).focus();
		}, 50 );
	}
	getOptionCompletionMapbox = option => {
		const { value } = option;
		const point = {
			place_title: value.text,
			title: value.text,
			caption: value.place_name,
			id: value.id,
			coordinates: {
				longitude: value.geometry.coordinates[ 0 ],
				latitude: value.geometry.coordinates[ 1 ],
			},
		};
		this.props.onAddPoint( point );
		return value.text;
	};

	searchMapbox = value => {
		const { api_key, onError } = this.props;
		const url =
			'https://api.mapbox.com/geocoding/v5/mapbox.places/' +
			encodeURI( value ) +
			'.json?access_token=' +
			api_key;
		return new Promise( function( resolve, reject ) {
			const xhr = new XMLHttpRequest();
			xhr.open( 'GET', url );
			xhr.onload = function() {
				if ( xhr.status === 200 ) {
					const res = JSON.parse( xhr.responseText );
					resolve( res.features );
				} else {
					const res = JSON.parse( xhr.responseText );
					onError( res.statusText, res.responseJSON.message );
					reject( new Error( 'Mapbox Places Error' ) );
				}
			};
			xhr.send();
		} );
	};
	getOptionCompletionGoogle = option => {
		const { value } = option;
		const placesService = new window.google.maps.places.PlacesService( this.containerRef.current );
		placesService.getDetails(
			{ placeId: value.place_id },
			function( place ) {
				const point = {
					place_title: place.name,
					title: place.name,
					caption: place.formatted_address,
					id: place.place_id,
					viewport: place.geometry.viewport,
					coordinates: {
						latitude: place.geometry.location.lat(),
						longitude: place.geometry.location.lng(),
					},
				};
				this.props.onAddPoint( point );
			}.bind( this )
		);
		return option.description;
	};

	searchGoogle = value => {
		const placeSearch = new window.google.maps.places.AutocompleteService();
		return new Promise( function( resolve, reject ) {
			placeSearch.getPlacePredictions(
				{
					input: value,
				},
				function( place, status ) {
					if ( status !== window.google.maps.places.PlacesServiceStatus.OK ) {
						reject( new Error( status ) );
					} else {
						resolve( place );
					}
				}
			);
		} );
	};
	onReset = () => {
		this.textRef.current.value = null;
	};
	render() {
		const { label } = this.props;
		return (
			<div ref={ this.containerRef }>
				<BaseControl label={ label } className="components-location-search">
					<Lookup completer={ this.autocompleter } onReset={ this.onReset }>
						{ ( { isExpanded, listBoxId, activeId, onChange, onKeyDown } ) => (
							<TextControl
								placeholder={ placeholderText }
								ref={ this.textRef }
								onChange={ onChange }
								aria-expanded={ isExpanded }
								aria-owns={ listBoxId }
								aria-activedescendant={ activeId }
								onKeyDown={ onKeyDown }
							/>
						) }
					</Lookup>
				</BaseControl>
			</div>
		);
	}
}

LocationSearch.defaultProps = {
	onError: () => {},
};

export default LocationSearch;
