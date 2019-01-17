/** @format */

/**
 * Internal dependencies
 */
import isJetpackExtensionAvailable from './is-jetpack-extension-available';

/**
 * Registers a generic gutenberg extension if the availability requirements are met.
 *
 * @param {string} name The extension's name.
 * @param {function} registerCallback Callback used to register the extension
 * @returns {object|false} Either false if the extension is not available, or the results of `registerCallback`
 */
export default function registerJetpackExtension( name, registerCallback ) {
	if ( ! isJetpackExtensionAvailable( name ) ) {
		// TODO: check 'unavailable_reason' and respond accordingly
		return false;
	}

	return registerCallback();
}
