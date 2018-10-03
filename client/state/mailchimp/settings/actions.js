/** @format */

/**
 * Internal dependencies
 */

import { MAILCHIMP_SETTINGS_LIST, MAILCHIMP_SETTINGS_RECEIVE } from 'state/action-types';

export const requestSettings = siteId => ( {
	siteId,
	type: MAILCHIMP_SETTINGS_LIST,
} );

export function receiveSettings( siteId, lists ) {
	return {
		siteId,
		type: MAILCHIMP_SETTINGS_RECEIVE,
		lists,
	};
}
