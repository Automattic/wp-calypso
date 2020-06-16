/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'state/mailchimp/init';

export function getListId( state, siteId ) {
	return get( state, [ 'mailchimp', 'settings', 'items', siteId, 'follower_list_id' ], 0 );
}
