/** @format */
/**
 * External dependencies
 */
import { getBlockType, registerBlockType, unregisterBlockType } from '@wordpress/blocks';
import { without } from 'lodash';

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
	const available = isJetpackExtensionAvailable( name );
	const blockName = `jetpack/${ name }`;
	const registered = getBlockType( blockName );

	if ( available && ! registered ) {
		const result = registerBlockType( blockName, settings );

		if ( childBlocks ) {
			childBlocks.forEach( ( { name: childName, settings: childSettings } ) => {
				// This might have been registered by another parent before
				if ( ! getBlockType( `jetpack/${ childName }` ) ) {
					registerBlockType( `jetpack/${ childName }`, childSettings );
				}
			} );
		}

		return result;
	} else if ( ! available ) {
		if ( registered ) {
			if ( childBlocks ) {
				childBlocks.forEach( ( { name: childName } ) => {
					const childBlock = getBlockType( `jetpack/${ childName }` );
					const otherParents = without( childBlock.parent, blockName );

					// Are any of the other parents currently registered?
					if ( ! otherParents.some( getBlockType ) ) {
						unregisterBlockType( `jetpack/${ childName }` );
					}
				} );
			}
			unregisterBlockType( blockName );
		}

		// TODO: check 'unavailable_reason' and respond accordingly
		return false;
	}
}
