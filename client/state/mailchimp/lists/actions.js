/** @format */

/**
 * Internal dependencies
 */

import { MAILCHIMP_LISTS_LIST, MAILCHIMP_LISTS_RECEIVE } from 'state/action-types';

export const requestList = siteId => ( {
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
