/* eslint-disable import/no-extraneous-dependencies */

/**
 * External dependencies
 */
import { addFilter } from '@wordpress/hooks';

/**
 * Prevents the CoBlocks Buttons block from being insertable.
 *
 * @param settings {object} Block settings.
 * @param name {string} Block name.
 * @returns {object} Updated block settings.
 */
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
