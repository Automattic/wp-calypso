/** @format */
/**
 * External dependencies
 */
import { get } from 'lodash';
import { registerPlugin } from '@wordpress/plugins';

/**
 * Internal dependencies
 */
import getJetpackData from './get-jetpack-data';

export default function registerJetpackPlugin( name, settings ) {
	const data = getJetpackData();
	const available = get( data, [ 'available_blocks', name, 'available' ], false );
	if ( data && ! available ) {
		// TODO: check 'unavailable_reason' and respond accordingly
		return false;
	}

	return registerPlugin( `jetpack-${ name }`, settings );
}
