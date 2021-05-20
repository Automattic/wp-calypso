/**
 * External dependencies
 */
import path from 'path';
import config from 'config';

/**
 * Internal dependencies
 */
import { getLocale, getViewportName } from './browser-helper';

const artifacts: { [ key: string ]: string } = config.get( 'artifacts' );

/**
 * Returns the base asset directory.
 *
 * If the environment variable TEMP_ASSET_PATH is set, this will return a path
 * to the directory. Otherwise, the parent directory of this current file.
 *
 * @returns {string} Absolute path to the directory.
 */
export function getAssetDir(): string {
	return path.resolve( process.env.TEMP_ASSET_PATH || path.join( __dirname, '..' ) );
}

/**
 * Returns the screenshot save directory.
 *
 * If the environment variable SCREENSHOTDIR is set, this will override all configuration
 * values. Otherwise, the default path contained in the configuration file is returned.
 *
 * @returns {string} Absolute path to the directory.
 */
export function getScreenshotDir(): string {
	return path.resolve( getAssetDir(), process.env.SCREENSHOTDIR || artifacts.screenshot );
}

/**
 * Returns the video save directory.
 *
 * If the environment variable VIDEODIR is set, this will override all configuration
 * values. Otherwise, the default path contained in the configuration file is returned.
 *
 * @returns {string} Absolute path to the directory.
 */
export function getVideoDir(): string {
	return path.resolve( getAssetDir(), process.env.VIDEODIR || artifacts.video );
}

/**
 * Returns a descriptive file name for the screenshot file.
 *
 * @param {string} name Name of the test case that failed.
 * @returns {string} A Path-like string.
 */
export function getScreenshotName( name: string ): string {
	const shortTestFileName = name.replace( /[^a-z0-9]/gi, '-' ).toLowerCase();
	const screenSize = getViewportName().toUpperCase();
	const locale = getLocale().toUpperCase();
	const date = getDateString();
	const fileName = `FAILED-${ locale }-${ screenSize }-${ shortTestFileName }-${ date }`;
	const screenshotDir = getScreenshotDir();
	return `${ screenshotDir }/${ fileName }.png`;
}

/**
 * Returns a descriptive file name for video recording file.
 *
 * @param {string} name Name of the suite and test case that failed.
 * @returns {string} A Path-like string.
 */
export function getVideoName( name: string ): string {
	const suiteName = name.replace( /[^a-z0-9]/gi, '-' ).toLowerCase();
	const locale = getLocale().toUpperCase();
	const screenSize = getViewportName().toUpperCase();
	const date = getDateString();
	const fileName = `FAILED-${ locale }-${ screenSize }-${ suiteName }-${ date }`;
	const videoDir = getVideoDir();
	return `${ videoDir }/${ fileName }.webm`;
}

/**
 * Returns the current date as a time stamp.
 *
 * @returns {string} Date represented as a timestamp.
 */
export function getDateString(): string {
	return new Date().getTime().toString();
}
