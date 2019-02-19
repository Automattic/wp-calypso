/**
 * External dependencies
 */
import { registerPlugin } from '@wordpress/plugins';

/**
 * Internal dependencies
 */
import getJetpackExtensionAvailability from './get-jetpack-extension-availability';

/**
 * Registers a Gutenberg block if the availability requirements are met.
 *
 * @param {string} name The plugin's name
 * @param {object} settings The plugin's settings.
 * @returns {object|false} Either false if the plugin is not available, or the results of `registerPlugin`
 */
export default function registerJetpackPlugin( name, settings ) {
	const { available, unavailableReason } = getJetpackExtensionAvailability( name );
	const unavailable = ! available;

	if ( unavailable ) {
		if ( 'production' !== process.env.NODE_ENV ) {
			// eslint-disable-next-line no-console
			console.warn(
				`Plugin ${ name } couldn't be registered because it is unavailable (${ unavailableReason }).`
			);
		}
		return false;
	}

	return registerPlugin( `jetpack-${ name }`, settings );
}
