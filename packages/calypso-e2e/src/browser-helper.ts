/**
 * Internal dependencies
 */
import type { screenSize, localeCode } from './types';

/**
 * Returns the target screen size for tests to run against.
 *
 * By default, this function will return 'desktop' as the target.
 * To specify another screen size, set the BROWSERSIZE environment variable.
 *
 * @returns {screenSize} Target screen size.
 */
export function getTargetScreenSize(): screenSize {
	return ! process.env.BROWSERSIZE
		? 'desktop'
		: ( process.env.BROWSERSIZE.toLowerCase() as screenSize );
}

/**
 * Returns the locale under test.
 *
 * By default, this function will return 'en' as the locale.
 * To set the locale, set the BROWSERLOCALE environment variable.
 *
 * @returns {localeCode} Target locale code.
 */
export function getTargetLocale(): localeCode {
	return ! process.env.BROWSERLOCALE ? 'en' : process.env.BROWSERLOCALE.toLowerCase();
}

/**
 * Returns a set of screen dimensions in numbers.
 *
 * This function takes the output of `getTargetScreenSize` and returns an
 * object key/value mapping of the screen diemensions represented by
 * the output.
 *
 * @returns {number, number} Object with key/value mapping of screen dimensions.
 * @throws {Error} If target screen size was not set.
 */
export function getScreenDimension(): { width: number; height: number } {
	switch ( getTargetScreenSize() ) {
		case 'mobile':
			return { width: 400, height: 1000 };
		case 'tablet':
			return { width: 1024, height: 1000 };
		case 'desktop':
			return { width: 1440, height: 1000 };
		case 'laptop':
			return { width: 1400, height: 790 };
		default:
			throw new Error( 'Unsupported screen size specified.' );
	}
}
