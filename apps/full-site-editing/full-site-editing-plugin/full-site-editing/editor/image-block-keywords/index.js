/* global wp */

/**
 * External dependencies
 */
import { assign } from 'lodash';

const additionalKeywords = [ 'logo', 'brand', 'emblem', 'hallmark' ];

wp.hooks.addFilter(
	'blocks.registerBlockType',
	'full-site-editing/editor/image-block-keywords',
	( settings, name ) => {
		if ( name !== 'core/image' ) {
			return settings;
		}

		settings = assign( {}, settings, {
			keywords: settings.keywords.concat( additionalKeywords ),
		} );

		return settings;
	}
);
