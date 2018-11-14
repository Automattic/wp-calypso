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
 * Where Jetpack data can be found in WP Admin
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
