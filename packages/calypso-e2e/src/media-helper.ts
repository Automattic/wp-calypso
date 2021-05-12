/**
 * External dependencies
 */
import path from 'path';

/**
 * Returns the screenshot save directory.
 *
 * @returns {string} Absolute path to the directory.
 */
export function getScreenshotDir(): string {
	return path.resolve(
		process.env.TEMP_ASSET_PATH || path.join( __dirname, '..' ),
		process.env.SCREENSHOTDIR || 'screenshots'
	);
}

/**
 * Returns the current date as a time stamp.
 *
 * @returns {string} Date represented as a timestamp.
 */
export function getDateString(): string {
	return new Date().getTime().toString();
}
