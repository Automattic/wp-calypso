/** @format */
/**
 * Internal dependencies
 */
import { getCurrentUser } from 'state/current-user/selectors';

/**
 * Returns whether the current uses right-to-left directionality.
 *
 * @param  {Object}   state      Global state tree
 * @return {?Boolean}            Current user is rtl
 */
export default function isRtl( state ) {
	const currentUser = getCurrentUser( state );
	if ( currentUser && currentUser.hasOwnProperty( 'isRTL' ) ) {
		return currentUser.isRTL;
	}
	return null;
}
