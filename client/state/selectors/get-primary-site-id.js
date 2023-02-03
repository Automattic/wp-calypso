import { get } from 'lodash';
import { getCurrentUser } from 'calypso/state/current-user/selectors';

/**
 * Returns the current user's primary site's ID.
 *
 * @param  {Object}  state Global state tree
 * @returns {?number}       The current user's primary site's ID
 */
export default function getPrimarySiteId( state ) {
	const currentUser = getCurrentUser( state );
	return get( currentUser, 'primary_blog', null );
}
