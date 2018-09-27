/** @format */

/**
 * Wordpress dependencies
 */

import { Component } from '@wordpress/element';

/**
 * External dependencies
 */

/**
 * Internal dependencies
 */

import config from './config.js';

export class MapComponent extends Component {

	render() {
		const { map_style } = this.props;
		return <p><strong>Map</strong>, with style: <em>{ map_style }</em></p>;
	}

}

MapComponent.defaultProps = {
	map_style: null
}

export default MapComponent;
