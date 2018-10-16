/**
 * Wordpress dependencies
 */

import { __ } from '@wordpress/i18n';

import {
	Component,
	createRef
} from '@wordpress/element';

import {
	BaseControl,
	TextControl
} from '@wordpress/components';

/**
 * External dependencies
 */

/**
 * Internal dependencies
 */

import Lookup from '../lookup';
import './style.scss';

const placeholderText = __( 'Add a marker...' );

export class LocationSearch extends Component {

	constructor() {

		super( ...arguments );

		this.textRef = createRef();
		this.testRef = createRef();
		this.state = {
			isEmpty: true
		};
		this.searchChanged = this.searchChanged.bind( this );
		this.onReset = this.onReset.bind( this );
		this.autocompleter = {

			name: 'placeSearch',
			options: this.search.bind(this),
			isDebounced: true,
			getOptionLabel: option => (
				<span>{ option.description }</span>
			),
			getOptionKeywords: option => [ option.description ],
			getOptionCompletion: this.getOptionCompletion.bind(this)

		};

	}

	getOptionCompletion( option ) {
		const { value } = option;
		const placesService = new window.google.maps.places.PlacesService( this.testRef.current );
		placesService.getDetails( { placeId: value.place_id }, function( place ) {
			const point = {
				place_title: place.name,
				title: place.name,
				caption: '',
				id: place.place_id,
				viewport: place.geometry.viewport,
				coordinates:  {
					latitude: place.geometry.location.lat(),
					longitude: place.geometry.location.lng()
				}
			}
			this.props.onAddPoint( point );
		}.bind(this));
		return option.description;

	}

	search( value ) {
		const placeSearch = new window.google.maps.places.AutocompleteService();
		return new Promise( function( resolve, reject ) {
			placeSearch.getPlacePredictions( {
				input: value
			}, function ( place, status ) {
				if ( status !== window.google.maps.places.PlacesServiceStatus.OK ) {
					reject( new Error( status ) );
				} else {
					resolve( place );
				}
			});
		});

	}

	searchChanged( value ) {

		this.setState( { isEmpty: value.length < 1 } );

	}

	onReset() {
		this.textRef.current.value = null;
	}

	render() {

		const { label } = this.props;
		return (
			<BaseControl label={ label } className='components-location-search'>
				<Lookup completer={ this.autocompleter } onReset={ this.onReset }>
					{ ( { isExpanded, listBoxId, activeId, onChange } ) => (
						<TextControl
							placeholder={ placeholderText }
							ref={ this.textRef }
					        onChange={ onChange }
					        aria-expanded={ isExpanded }
	                        aria-owns={ listBoxId }
	                        aria-activedescendant={ activeId }
					    />
					) }
				</Lookup>
				<div ref={ this.testRef }></div>
			</BaseControl>
		);

	}
}

export default LocationSearch;
