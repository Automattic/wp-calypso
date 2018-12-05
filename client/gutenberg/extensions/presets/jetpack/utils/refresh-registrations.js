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
	const extensionAvailability = get( getJetpackData(), [ 'available_blocks' ] );

	if ( ! extensionAvailability ) {
		return;
	}

	forEach( extensions, ( settings, name ) => {
		const available = get( extensionAvailability, [ name, 'available' ] );
		if ( has( settings, [ 'render' ] ) ) {
			// If the extension has a `render` method, it's not a block but a plugin
			const pluginName = `jetpack-${ name }`;

			if ( available ) {
				registerPlugin( pluginName );
			} else if ( getPlugin( pluginName ) ) {
				// Registered, but no longer available
				unregisterPlugin( pluginName );
			}
		} else {
			const blockName = `jetpack-/${ name }`;

			if ( available ) {
				registerBlockType( blockName, settings );
			} else if ( getBlockType( blockName ) ) {
				// Registered, but no longer available
				unregisterBlockType( blockName );
			}
		}
	} );
}
