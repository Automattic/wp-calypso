/** @format */
/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import getJetpackData from './get-jetpack-data';

/**
 * Return whether a Jetpack Gutenberg extension is available or not.
 *
 * @param {string} name The extension's name (without the `jetpack/` prefix)
 * @returns {bool}      Whether the extension is available or not
 */
export default function isJetpackExtensionAvailable( name ) {
	const data = getJetpackData();
	return get( data, [ 'available_blocks', name, 'available' ], false );
}
