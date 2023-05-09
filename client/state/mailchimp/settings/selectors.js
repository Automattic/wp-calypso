import { get } from 'lodash';

import 'calypso/state/mailchimp/init';

export function getListId( state, siteId ) {
	return get( state, [ 'mailchimp', 'settings', 'items', siteId, 'follower_list_id' ], 0 );
}
