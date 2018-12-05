/** @format */
/**
 * External dependencies
 */
import { forEach } from 'lodash';
import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import getJetpackData from './get-jetpack-data';

/**
 * Refreshes registration of Gutenberg extensions (blocks and plugins)
 *
 * Uses block and plugin availability information obtained from the server to conditionally
 * register and/or unregister blocks and plugins accordingly
 *
 * @returns {void}
 */
export default function refreshRegistrations() {
	const extensions = getJetpackData();

	if ( ! extensions ) {
		return;
	}

	forEach( extensions, ( { available }, name ) => {
		if ( available ) {
			// TODO: Need settings. Probably export from individual block files
			registerBlockType( name, settings );
		} else {
			// Check if block is registered
			// if it is, unregister
		}
	} );
}
