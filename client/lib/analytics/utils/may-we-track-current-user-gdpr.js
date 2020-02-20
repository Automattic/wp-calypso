/**
 * External dependencies
 */
import cookie from 'cookie';

/**
 * Internal dependencies
 */
import debug from './debug';
import isCurrentUserMaybeInGdprZone from './is-current-user-maybe-in-gdpr-zone';

/**
 * Returns a boolean telling whether we may track the current user.
 *
 * @returns {boolean} Whether we may track the current user
 */
export default function mayWeTrackCurrentUserGdpr() {
	let result = false;
	const cookies = cookie.parse( document.cookie );
	if ( cookies.sensitive_pixel_option === 'yes' ) {
		result = true;
	} else if ( cookies.sensitive_pixel_option === 'no' ) {
		result = false;
	} else {
		result = ! isCurrentUserMaybeInGdprZone();
	}
	debug( `mayWeTrackCurrentUserGdpr: ${ result }` );
	return result;
}
