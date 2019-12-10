/**
 * External dependencies
 */
import { assign } from 'lodash';
import { addFilter } from '@wordpress/hooks';

const additionalKeywords = [ 'logo', 'brand', 'emblem', 'hallmark' ];

addFilter(
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
