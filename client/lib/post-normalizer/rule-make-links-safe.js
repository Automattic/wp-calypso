/**
 */

/**
 * Internal dependencies
 */
import { safeLinkRe } from './utils';

export default function makeLinksSafe( post ) {
	if ( post && post.URL && ! safeLinkRe.test( post.URL ) ) {
		post.URL = '';
	}

	if ( post && post.short_URL && ! safeLinkRe.test( post.short_URL ) ) {
		post.short_URL = '';
	}
	return post;
}
