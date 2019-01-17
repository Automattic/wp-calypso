/** @format */
/**
 * External dependencies
 */
import { getPlugin, registerPlugin, unregisterPlugin } from '@wordpress/plugins';

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
	const available = isJetpackExtensionAvailable( name );
	const pluginName = `jetpack-${ name }`;
	const registered = getPlugin( pluginName );

	if ( available && ! registered ) {
		registerPlugin( pluginName, settings );
	} else if ( ! available ) {
		if ( registered ) {
			unregisterPlugin( pluginName );
		}

		// TODO: check 'unavailable_reason' and respond accordingly
		return false;
	}
}
