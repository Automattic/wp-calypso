/**
 * External dependencies
 */
import config from 'config';

/**
 * Internal dependencies
 */
import type { displaySize, localeCode, displayDimensions } from './types';

/**
 * Returns the target screen size for tests to run against.
 *
 * If the environment variable BROWSERSIZE is set, this will override all configuration
 * values. Otherwise, the default path contained in the configuration file is returned.
 *
 * @returns {displaySize} Target screen size.
 */
export function getTargetDisplaySize(): displaySize {
	return ! process.env.DISPLAYSIZE
		? config.get( 'displaySize' )
		: ( process.env.DISPLAYSIZE.toLowerCase() as displaySize );
}

/**
 * Returns the locale under test.
 *
 * If the environment variable BROWSERLOCALE is set, this will override all configuration
 * values. Otherwise, the default path contained in the configuration file is returned.
 *
 * @returns {localeCode} Target locale code.
 */
export function getTargetLocale(): localeCode {
	return ! process.env.TARGETLOCALE
		? config.get( 'locale' )
		: process.env.TARGETLOCALE.toLowerCase();
}

/**
 * Returns a set of screen dimensions in numbers.
 *
 * This function takes the output of `getTargetDisplaySize` and returns an
 * object key/value mapping of the screen diemensions represented by
 * the output.
 *
 * @param {displaySize} [target] Target display size to use, overriding defaults.
 * @returns {displayDimensions} Object with key/value mapping of screen dimensions.
 * @throws {Error} If target screen size was not set.
 */
export function getDisplayResolution( target?: displaySize ): displayDimensions {
	if ( ! target ) {
		target = getTargetDisplaySize();
	}

	try {
		const resolutions: { [ key: string ]: displayDimensions } = config.get( 'displayResolutions' );
		return resolutions[ target ];
	} catch ( err ) {
		throw new Error( 'Unsupported screen size specified.' );
	}
}
