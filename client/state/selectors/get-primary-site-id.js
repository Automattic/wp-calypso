/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { getCurrentUser } from 'state/current-user/selectors';

/**
 * Returns the current user's primary site's ID.
 *
 * @param  {Object}  state Global state tree
 * @return {?Number}       The current user's primary site's ID
 */
export default function getPrimarySiteId( state ) {
	const currentUser = getCurrentUser( state );
	return get( currentUser, 'primary_blog', null );
}
