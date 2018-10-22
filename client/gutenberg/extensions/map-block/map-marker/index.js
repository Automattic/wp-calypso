/** @format */

/**
 * External dependencies
 */

import { Component } from '@wordpress/element';

/**
 * Internal dependencies
 */

export class MapMarker extends Component {
	componentDidMount() {
		this.renderMarker();
	}
	componentWillUnmount() {
		if ( this.marker ) {
			this.marker.setMap( null );
		}
	}
	componentDidUpdate() {
		this.renderMarker();
	}
	handleClick = () => {
		const { onClick } = this.props;
		onClick( this );
	};
	renderMarker() {
		const { map, point, google, icon } = this.props;

		const { handleClick } = this;

		const position = new google.LatLng( point.coordinates.latitude, point.coordinates.longitude );

		if ( this.marker ) {
			this.marker.setPosition( position );
			this.marker.setIcon( icon );
		} else {
			this.marker = new google.Marker( { position, map, icon } );
			this.marker.addListener( 'click', handleClick );
		}
	}
	render() {
		return null;
	}
}

MapMarker.defaultProps = {
	point: {},
	map: null,
	icon: null,
	google: null,
	onClick: () => {},
};

export default MapMarker;
