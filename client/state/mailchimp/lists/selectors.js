/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'state/mailchimp/init';

export function getAllLists( state, siteId ) {
	return get( state, [ 'mailchimp', 'lists', 'items', siteId ], null );
}
