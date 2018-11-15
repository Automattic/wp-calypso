/** @format */
/**
 * External dependencies
 */
import { registerBlockType } from '@wordpress/blocks';
import get from 'lodash/get';

/**
 * Internal dependencies
 */
import getJetpackData from './get-jetpack-data';

/**
 * Registers a gutenberg block if the availability requirements are met.
 *
 * @param {string} name The block's name.
 * @param {object} settings The block's settings.
 * @returns {object|false} Either false if the block is not available, or the results of `registerBlockType`
 */
export default function registerJetpackBlock( name, settings ) {
	const data = getJetpackData();
	const available = get( data, [ 'available_blocks', name, 'available' ], false );
	if ( data && ! available ) {
		// TODO: check 'unavailable_reason' and respond accordingly
		return false;
	}

	return registerBlockType( `jetpack/${ name }`, settings );
}
