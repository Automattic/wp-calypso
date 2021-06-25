/**
 * Internal dependencies
 */
import { MAILCHIMP_LISTS_LIST, MAILCHIMP_LISTS_RECEIVE } from 'calypso/state/action-types';

import 'calypso/state/data-layer/wpcom/sites/mailchimp';
import 'calypso/state/mailchimp/init';

export const requestList = ( siteId ) => ( {
	siteId,
	type: MAILCHIMP_LISTS_LIST,
} );

export function receiveLists( siteId, lists ) {
	return {
		siteId,
		type: MAILCHIMP_LISTS_RECEIVE,
		lists,
	};
}
