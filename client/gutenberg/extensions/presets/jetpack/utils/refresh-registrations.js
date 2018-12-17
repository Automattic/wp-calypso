/** @format */
/**
 * External dependencies
 */
import { get, has, without } from 'lodash';
import { getBlockType, registerBlockType, unregisterBlockType } from '@wordpress/blocks';
import { getPlugin, registerPlugin, unregisterPlugin } from '@wordpress/plugins';

/**
 * Internal dependencies
 */
import getJetpackData from './get-jetpack-data';
import { getExtensions } from '../index.js';

/**
 * Refreshes registration of Gutenberg extensions (blocks and plugins)
 *
 * Uses block and plugin availability information obtained from the server to conditionally
 * register and/or unregister blocks and plugins accordingly
 *
 * @returns {void}
 */
export default async function refreshRegistrations() {
	const extensionAvailability = get( getJetpackData(), [ 'available_blocks' ] );

	if ( ! extensionAvailability ) {
		return;
	}

	const extensions = await getExtensions();

	extensions.forEach( extension => {
		const { childBlocks, name, settings } = extension;
		const available = get( extensionAvailability, [ name, 'available' ] );

		if ( has( settings, [ 'render' ] ) ) {
			// If the extension has a `render` method, it's not a block but a plugin
			const pluginName = `jetpack-${ name }`;
			const registered = getPlugin( pluginName );

			if ( available && ! registered ) {
				registerPlugin( pluginName, settings );
			} else if ( ! available && registered ) {
				unregisterPlugin( pluginName );
			}
		} else {
			const blockName = `jetpack/${ name }`;
			const registered = getBlockType( blockName );

			if ( available && ! registered ) {
				registerBlockType( blockName, settings );
				if ( childBlocks ) {
					childBlocks.forEach( ( { name: childName, settings: childSettings } ) => {
						// This might have been registered by another parent before
						if ( ! getBlockType( `jetpack/${ childName }` ) ) {
							registerBlockType( `jetpack/${ childName }`, childSettings );
						}
					} );
				}
			} else if ( ! available && registered ) {
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
		}
	} );
}
