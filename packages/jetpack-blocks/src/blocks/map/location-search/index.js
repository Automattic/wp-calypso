/**
 * External dependencies
 */
import { Component, createRef } from '@wordpress/element';
import { BaseControl, TextControl } from '@wordpress/components';

/**
 * Internal dependencies
 */
import Lookup from '../lookup';
import { __ } from '../../../utils/i18n';

const placeholderText = __( 'Add a marker…' );

export class LocationSearch extends Component {
	constructor() {
		super( ...arguments );

		this.textRef = createRef();
		this.containerRef = createRef();
		this.state = {
			isEmpty: true,
		};
		this.autocompleter = {
			name: 'placeSearch',
			options: this.search,
			isDebounced: true,
			getOptionLabel: option => <span>{ option.place_name }</span>,
			getOptionKeywords: option => [ option.place_name ],
			getOptionCompletion: this.getOptionCompletion,
		};
	}
	componentDidMount() {
		setTimeout( () => {
			this.containerRef.current.querySelector( 'input' ).focus();
		}, 50 );
	}
	getOptionCompletion = option => {
		const { value } = option;
		const point = {
			placeTitle: value.text,
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

	search = value => {
		const { apiKey, onError } = this.props;
		const url =
			'https://api.mapbox.com/geocoding/v5/mapbox.places/' +
			encodeURI( value ) +
			'.json?access_token=' +
			apiKey;
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
