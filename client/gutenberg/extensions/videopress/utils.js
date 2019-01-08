/** @format */

/**
 * External dependencies
 */
import { registerBlockType, unregisterBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import isJetpackExtensionAvailable from 'gutenberg/extensions/presets/jetpack/utils/is-jetpack-extension-available';
import { name, settings } from '.';

/**
 * Replace the Core video block with the VideoPress block, if the extension is available.
 */
export const replaceCoreVideoBlock = () => {
	const available = isJetpackExtensionAvailable( name );

	// In order to don't break existing posts containing Core video blocks, we cannot
	// unregister it. Instead, we change it so it cannot be inserted anymore. Since we
	// cannot directly update the block definition in Gutenberg, we have to unregister
	// it and register it again with the updated settings.
	if ( available ) {
		unregisterBlockType( 'core/video' );
		registerBlockType( 'core/video', {
			...settings,
			supports: {
				inserter: false,
			},
		} );
	}
};
