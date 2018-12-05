/** @format */
/**
 * External dependencies
 */
import { forEach, get, has } from 'lodash';
import { getBlockType, registerBlockType, unregisterBlockType } from '@wordpress/blocks';
import { getPlugin, registerPlugin, unregisterPlugin } from '@wordpress/plugins';

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
		const settings = get( extensions, [ name ] );
		if ( has( settings, [ 'render' ] ) ) {
			// If the extension has a `render` method, it's not a block but a plugin
			if ( available ) {
				registerPlugin( name );
			} else if ( getPlugin( name ) ) {
				// Registered, but no longer available
				unregisterPlugin( name );
			}
		} else if ( available ) {
			registerBlockType( name, settings );
		} else if ( getBlockType( name ) ) {
			// Registered, but no longer available
			unregisterBlockType( name );
		}
	} );
}
