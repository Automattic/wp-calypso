/** @format */
/**
 * External dependencies
 */
import { get, includes } from 'lodash';

/**
 * Internal dependencies
 */
import extensionSlugsJson from '../index.json';
import getJetpackData from './get-jetpack-data';

/**
 * Return whether a Jetpack Gutenberg extension is available or not.
 *
 * Defaults to `false` for production blocks, and to `true` for beta blocks.
 * This is to make it easier for folks to write their first block without needing
 * to touch the server side,
 *
 * @param {string} name The extension's name (without the `jetpack/` prefix)
 * @returns {bool}      Whether the extension is available or not
 */
export default function isJetpackExtensionAvailable( name ) {
	const data = getJetpackData();
	const defaultAvailability = includes( extensionSlugsJson.beta, name );
	return get( data, [ 'available_blocks', name, 'available' ], defaultAvailability );
}
