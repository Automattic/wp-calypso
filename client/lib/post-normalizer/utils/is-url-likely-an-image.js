/**
 * External Dependencies
 */
import { some, endsWith } from 'lodash';
import url from 'url';

/** Determine if url is likely pointed to an image
 *
 * @param {string} uri - a url
 * @returns {boolean} - true or false depending on if it is probably an image (has the right extension)
 */
export function isUrlLikelyAnImage( uri ) {
	if ( ! uri ) {
		return false;
	}

	const withoutQuery = url.parse( uri ).pathname;
	return some( [ '.jpg', '.jpeg', '.png', '.gif' ], ( ext ) => endsWith( withoutQuery, ext ) );
}
