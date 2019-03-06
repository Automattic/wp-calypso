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
 * to touch the server side.
 *
 * @param {string} name The extension's name (without the `jetpack/` prefix)
 * @returns {object} Object indicating if the extension is available (property `available`) and the reason why it is
 * unavailable (property `unavailable_reason`).
 */
export default function getJetpackExtensionAvailability( name ) {
	const data = getJetpackData();
	const defaultAvailability = includes( extensionSlugsJson.beta, name );
	const available = get( data, [ 'available_blocks', name, 'available' ], defaultAvailability );
	const unavailableReason = get( data, [ 'available_blocks', name, 'unavailable_reason' ], 'unknown' );

	return {
		available,
		...( ! available && { unavailableReason } ),
	};
}
