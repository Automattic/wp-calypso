/** @format */

/**
 * External dependencies
 */

import { Component } from '@wordpress/element';

class MapSave extends Component {
	render() {
		const { className, attributes } = this.props;
		const { map_style, map_details, points, zoom, map_center, marker_color } = attributes;
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
				data-map_style={ map_style }
				data-map_details={ map_details }
				data-points={ JSON.stringify( points ) }
				data-zoom={ zoom }
				data-map_center={ JSON.stringify( map_center ) }
				data-marker_color={ marker_color }
			>
				{ points.length > 0 && <ul>{ pointsList }</ul> }
			</div>
		);
	}
}

export default MapSave;
