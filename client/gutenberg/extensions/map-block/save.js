/** @format */

/**
 * External dependencies
 */

import { Component } from '@wordpress/element';

/**
 * Internal dependencies
 */

class MapSave extends Component {
	render() {
		const { className, attributes } = this.props;
		const { map_style, map_details, points, zoom, map_center, marker_color } = attributes;
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
				<iframe
					title="Map"
					width="425"
					height="350"
					frameborder="0"
					scrolling="no"
					marginheight="0"
					marginwidth="0"
					src="https://www.openstreetmap.org/export/embed.html?bbox=-232.91015625000003%2C-32.99023555965107%2C-55.19531250000001%2C75.32002523220804&amp;layer=mapnik"
					style="border: 1px solid black"
				/>
				<br />
				<small>
					<a href="https://www.openstreetmap.org/#map=3/38.07/-144.05">View Larger Map</a>
				</small>
			</div>
		);
	}
}

export default MapSave;
