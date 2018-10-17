/** @format */

/**
 * Wordpress dependencies
 */

import { Component } from '@wordpress/element';

/**
 * External dependencies
 */

import classnames from 'classnames';

/**
 * Internal dependencies
 */

import { CONFIG } from './config.js';

/**
 * Module variables
 */

class MapSave extends Component {
	render() {
		const { className, attributes } = this.props;
		const { map_style, points, zoom, map_center, marker_color, align } = attributes;
		const atavistAlignClass = value => {
			switch ( value ) {
				case 'left':
				case 'right':
				case 'center':
				case 'full':
					return 'atavist-block-align-' + value;
				default:
					return 'atavist-block-align-center';
			}
		};
		const classes = classnames( CONFIG.baseClasses, className, atavistAlignClass( align ) );
		return (
			<div
				className={ classes }
				data-map_style={ map_style }
				data-points={ JSON.stringify( points ) }
				data-zoom={ zoom }
				data-map_center={ JSON.stringify( map_center ) }
				data-marker_color={ marker_color }
				data-api_key={ CONFIG.GOOGLE_MAPS_API_KEY }
			/>
		);
	}
}

export default MapSave;
