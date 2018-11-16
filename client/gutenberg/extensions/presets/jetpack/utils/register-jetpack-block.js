/** @format */
/**
 * External dependencies
 */
import { get } from 'lodash';
import { registerBlockType } from '@wordpress/blocks';

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
