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
 * @param {object} childBlocks The block's child blocks.
 * @returns {object|false} Either false if the block is not available, or the results of `registerBlockType`
 */
export default function registerJetpackBlock( name, settings, childBlocks = [] ) {
	if ( ! isJetpackExtensionAvailable( name ) ) {
		// TODO: check 'unavailable_reason' and respond accordingly
		return false;
	}

	const result = registerBlockType( `jetpack/${ name }`, settings );

	// Register child blocks. Using `registerBlockType()` directly avoids availability checks -- if
	// their parent is available, we register them all, without checking for their individual availability.
	childBlocks.forEach( childBlock =>
		registerBlockType( `jetpack/${ childBlock.name }`, childBlock.settings )
	);

	return result;
}
