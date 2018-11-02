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
			/>
		);
	}
}

export default MapSave;
