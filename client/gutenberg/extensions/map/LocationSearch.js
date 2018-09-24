/**
 * Wordpress dependencies
 */
import { Autocomplete } from '@wordpress/editor';
import { Component, createRef } from '@wordpress/element';

/**
 * External dependencies
 */

import classnames from 'classnames';

/**
 * Internal dependencies
 */

import './LocationSearch.scss';

export class LocationSearch extends Component {
	constructor() {
		super( ...arguments )
		this.textRef = createRef()
		this.testRef = createRef()
		this.state = {
			isEmpty: true
		}
		this.autocompleters = [
	        {
	            name: 'placeSearch',
	            triggerPrefix: '',
	            options: this.search.bind(this),
				isDebounced: true,
	            getOptionLabel: option => (
	                <span>{ option.description }</span>
	            ),
	            getOptionKeywords: option => [ option.description ],
	            getOptionCompletion: this.getOptionCompletion.bind(this)
	        }
        ];
	}
	getOptionCompletion( option ) {
		const placesService = new window.google.maps.places.PlacesService( this.testRef.current );
		this.textRef.current.innerHTML = '';
		this.textRef.current.focus();
		placesService.getDetails( { placeId: option.place_id }, function( place ) {
			const point = {
				place_title: option.description,
				title: '',
		        caption: '',
		        id: option.place_id,
		        viewport: place.geometry.viewport,
		        coordinates:  {
		          latitude: place.geometry.location.lat(),
		          longitude: place.geometry.location.lng()
		        },
			}
			this.props.CommitPoint( point );
			this.textRef.current.innerHTML = '';
        }.bind(this));
	    return option.description;
	}
	search() {
		const searchText = this.textRef.current.innerText;
		const placeSearch = new window.google.maps.places.AutocompleteService()
		if ( searchText.length < 2 ) return
		return new Promise( function( resolve, reject ) {
			placeSearch.getPlacePredictions( {
	            input: searchText
	        }, function ( place, status ) {
	            if ( status !== window.google.maps.places.PlacesServiceStatus.OK ) {
	            	reject( new Error( status ) );
	            } else {
	                resolve( place );
	            }
	        });
		});
	}
	searchChanged( e ) {
		this.setState( { isEmpty: e.target.innerText.length < 1 } );
	}
	render() {
		const classes = classnames(
			'input-control',
			'component-location_search__search-field',
			this.state.isEmpty ? 'is-empty' : null
		);
		return (
			<div className='components-location-search'>
				<Autocomplete onfindmatch={ this.findMatch } completers={ this.autocompleters }>
	                { ( { isExpanded, listBoxId } ) => (
	                    <div
	                    	className={ classes }
	                        contentEditable
	                        suppressContentEditableWarning
	                        aria-autocomplete="list"
	                        aria-expanded={ isExpanded }
	                        aria-owns={ listBoxId }
	                        ref={ this.textRef }
	                        onInput={ this.searchChanged.bind(this) }
	                    ></div>
	                ) }
	            </Autocomplete>
	            <div ref={ this.testRef }></div>
            </div>
        );
	}
}

export default LocationSearch;
