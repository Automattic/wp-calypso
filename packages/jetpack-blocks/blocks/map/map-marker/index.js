/**
 * External dependencies
 */
import { Component } from '@wordpress/element';

/**
 * Internal dependencies
 */
import './style.scss';

export class MapMarker extends Component {
	componentDidMount() {
		this.renderMarker();
	}
	componentWillUnmount() {
		if ( this.marker ) {
			this.marker.remove();
		}
	}
	componentDidUpdate() {
		this.renderMarker();
	}
	handleClick = () => {
		const { onClick } = this.props;
		onClick( this );
	};
	getPoint = () => {
		const { point } = this.props;
		return [ point.coordinates.longitude, point.coordinates.latitude ];
	};
	renderMarker() {
		const { map, point, mapboxgl, markerColor } = this.props;
		const { handleClick } = this;
		const mapboxPoint = [ point.coordinates.longitude, point.coordinates.latitude ];
		const el = this.marker ? this.marker.getElement() : document.createElement( 'div' );
		if ( this.marker ) {
			this.marker.setLngLat( mapboxPoint );
		} else {
			el.className = 'wp-block-jetpack-map-marker';
			this.marker = new mapboxgl.Marker( el )
				.setLngLat( mapboxPoint )
				.setOffset( [ 0, -19 ] )
				.addTo( map );

			this.marker.getElement().addEventListener( 'click', handleClick );
		}
		el.innerHTML =
			'<?xml version="1.0" encoding="UTF-8"?><svg version="1.1" viewBox="0 0 32 38" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g fill-rule="evenodd"><path id="d" d="m16 38s16-11.308 16-22-7.1634-16-16-16-16 5.3076-16 16 16 22 16 22z" fill="' +
			markerColor +
			'" mask="url(#c)"/></g></svg>';
	}
	render() {
		return null;
	}
}

MapMarker.defaultProps = {
	point: {},
	map: null,
	markerColor: '#000000',
	mapboxgl: null,
	onClick: () => {},
};

export default MapMarker;
