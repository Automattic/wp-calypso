/* eslint-disable import/no-extraneous-dependencies */

/**
 * External dependencies
 */
import { addFilter } from '@wordpress/hooks';

function deprecateCoBlocksButtonsSettings( settings, name ) {
	if ( name !== 'coblocks/buttons' ) {
		return settings;
	}

	return {
		...settings,
		supports: {
			...settings.supports,
			inserter: false,
		},
	};
}

addFilter(
	'blocks.registerBlockType',
	'wpcom-block-editor/coblocks-buttons',
	deprecateCoBlocksButtonsSettings
);
