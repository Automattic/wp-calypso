/**
 * External dependencies
 */
import { registerBlockType } from '@wordpress/blocks';
import has from 'lodash/has';
import get from 'lodash/get';
import pickBy from 'lodash/pickBy';

/**
 * Internal dependencies
 */
import getJetpackData from './get-jetpack-data';

/**
 * Where Jetpack data can be found in WP Admin
 */


export default function registerJetpackBlock( name, settings, required ) {
	const data = getJetpackData();
	if (
		data &&
		required &&
		! has( pickBy( get( data, 'available_blocks' ), block => block.available ), required )
	) {
		return false;
	}
	return registerBlockType( name, settings );
}

