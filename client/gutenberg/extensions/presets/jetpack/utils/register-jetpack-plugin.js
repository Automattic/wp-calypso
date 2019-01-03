/** @format */
/**
 * External dependencies
 */
import { registerPlugin } from '@wordpress/plugins';

/**
 * Internal dependencies
 */
import isJetpackExtensionAvailable from './is-jetpack-extension-available';

/**
 * Registers a Gutenberg block if the availability requirements are met.
 *
 * @param {string} name The plugin's name
 * @param {object} settings The plugin's settings.
 * @returns {object|false} Either false if the plugin is not available, or the results of `registerPlugin`
 */
export default function registerJetpackPlugin( name, settings ) {
	if ( ! isJetpackExtensionAvailable( name ) ) {
		// TODO: check 'unavailable_reason' and respond accordingly
		return false;
	}

	return registerPlugin( `jetpack-${ name }`, settings );
}
