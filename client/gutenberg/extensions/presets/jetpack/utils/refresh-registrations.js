/** @format */
/**
 * External dependencies
 */
import { forEach, has } from 'lodash';
import { getBlockType, registerBlockType, unregisterBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import getJetpackData from './get-jetpack-data';
import extensions from '../editor';

/**
 * Refreshes registration of Gutenberg extensions (blocks and plugins)
 *
 * Uses block and plugin availability information obtained from the server to conditionally
 * register and/or unregister blocks and plugins accordingly
 *
 * @returns {void}
 */
export default function refreshRegistrations() {
	const extensionAvailability = getJetpackData();

	if ( ! extensions ) {
		return;
	}

	forEach( extensionAvailability, ( { available }, name ) => {
		// TODO: Discern between blocks and plugins, use [un]registerPlugin for the latter
		if ( available && has( extensions, [ name ] ) ) {
			const settings = extensions[ name ];
			registerBlockType( name, settings );
		} else if ( getBlockType( name ) ) {
			// The block is currently registered but becoming unavailable
			unregisterBlockType( name );
		}
	} );
}
