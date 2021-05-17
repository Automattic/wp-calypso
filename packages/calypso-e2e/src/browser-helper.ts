/**
 * External dependencies
 */
import config from 'config';

/**
 * Internal dependencies
 */
import type { viewportName, localeCode, viewportSize } from './types';

/**
 * Returns the target screen size for tests to run against.
 *
 * If the environment variable BROWSERSIZE is set, this will override all configuration
 * values. Otherwise, the default path contained in the configuration file is returned.
 *
 * @returns {viewportName} Target screen size.
 */
export function getViewportName(): viewportName {
	return ! process.env.VIEWPORT_NAME
		? config.get( 'viewportName' )
		: ( process.env.VIEWPORT_NAME.toLowerCase() as viewportName );
}

/**
 * Returns the locale under test.
 *
 * If the environment variable BROWSERLOCALE is set, this will override all configuration
 * values. Otherwise, the default path contained in the configuration file is returned.
 *
 * @returns {localeCode} Target locale code.
 */
export function getLocale(): localeCode {
	return ! process.env.LOCALE ? config.get( 'locale' ) : process.env.LOCALE.toLowerCase();
}

/**
 * Returns a set of screen dimensions in numbers.
 *
 * This function takes the output of `getViewportName` and returns an
 * object key/value mapping of the screen diemensions represented by
 * the output.
 *
 * @param {viewportName} [target] Target display size to use, overriding defaults.
 * @returns {viewportSize} Object with key/value mapping of screen dimensions.
 * @throws {Error} If target screen size was not set.
 */
export function getViewportSize( target?: viewportName ): viewportSize {
	if ( ! target ) {
		target = getViewportName();
	}

	try {
		const resolutions: { [ key: string ]: viewportSize } = config.get( 'viewportSize' );
		return resolutions[ target ];
	} catch ( err ) {
		throw new Error( 'Unsupported screen size specified.' );
	}
}
