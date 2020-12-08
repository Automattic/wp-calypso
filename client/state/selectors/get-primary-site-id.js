/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { getCurrentUser } from 'calypso/state/current-user/selectors';

/**
 * Returns the current user's primary site's ID.
 *
 * @param  {object}  state Global state tree
 * @returns {?number}       The current user's primary site's ID
 */
export default function getPrimarySiteId( state ) {
	const currentUser = getCurrentUser( state );
	return get( currentUser, 'primary_blog', null );
}
