import cookie from 'cookie';
import debug from './debug';
import isCountryInGdprZone from './is-country-in-gdpr-zone';

/**
 * Returns a boolean telling whether we may track the current user.
 *
 * WARNING: this function only works on the client side.
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
		const countryCode = cookies.country_code;
		result =
			countryCode !== undefined &&
			countryCode !== 'unknown' &&
			! isCountryInGdprZone( countryCode );
	}
	debug( `mayWeTrackCurrentUserGdpr: ${ result }` );
	return result;
}
