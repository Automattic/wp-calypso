/** @format */
/**
 * External dependencies
 */
import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import isJetpackExtensionAvailable from './is-jetpack-extension-available';

/**
 * Registers a gutenberg block if the availability requirements are met.
 *
 * @param {string} name The block's name.
 * @param {object} settings The block's settings.
 * @returns {object|false} Either false if the block is not available, or the results of `registerBlockType`
 */
export default function registerJetpackBlock( name, settings ) {
	if ( ! isJetpackExtensionAvailable( name ) ) {
		// TODO: check 'unavailable_reason' and respond accordingly
		return false;
	}

	return registerBlockType( `jetpack/${ name }`, settings );
}
