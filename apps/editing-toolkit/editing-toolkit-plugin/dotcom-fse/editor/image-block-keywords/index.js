/**
 * External dependencies
 */
import { addFilter } from '@wordpress/hooks';

const additionalKeywords = [ 'logo', 'brand', 'emblem', 'hallmark' ];

addFilter(
	'blocks.registerBlockType',
	'full-site-editing/editor/image-block-keywords',
	( settings, name ) => {
		if ( name !== 'core/image' ) {
			return settings;
		}

		settings = {
			...settings,
			keywords: settings.keywords.concat( additionalKeywords ),
		};

		return settings;
	}
);
