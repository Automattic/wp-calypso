import cookie from 'cookie';
import debug from './debug';
import isCurrentUserMaybeInGdprZone from './is-current-user-maybe-in-gdpr-zone';

/**
 * Returns a boolean telling whether we may track the current user.
 *
 * @returns Whether we may track the current user
 */
export default function mayWeTrackCurrentUserGdpr(): boolean {
	let result = false;
	const cookies = cookie.parse( document.cookie );
	if ( cookies.sensitive_pixel_option === 'yes' ) {
		result = true;
	} else if ( cookies.sensitive_pixel_option === 'no' ) {
		result = false;
	} else {
		result = ! isCurrentUserMaybeInGdprZone( cookies );
	}
	debug( `mayWeTrackCurrentUserGdpr: ${ result }` );
	return result;
}
