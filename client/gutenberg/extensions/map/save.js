/** @format */

/**
 * External dependencies
 */

import { Component } from '@wordpress/element';

class MapSave extends Component {
	render() {
		const { className, attributes } = this.props;
		const { mapStyle, mapDetails, points, zoom, mapCenter, markerColor } = attributes;
		const pointsList = points.map( point => {
			const { longitude, latitude } = point.coordinates;
			const url = 'https://www.google.com/maps/search/?api=1&&query=' + latitude + ',' + longitude;
			return (
				<li>
					<a href={ url }>{ point.title }</a>
				</li>
			);
		} );
		return (
			<div
				className={ className }
				data-mapStyle={ mapStyle }
				data-mapDetails={ mapDetails }
				data-points={ JSON.stringify( points ) }
				data-zoom={ zoom }
				data-mapCenter={ JSON.stringify( mapCenter ) }
				data-markerColor={ markerColor }
			>
				{ points.length > 0 && <ul>{ pointsList }</ul> }
			</div>
		);
	}
}

export default MapSave;
