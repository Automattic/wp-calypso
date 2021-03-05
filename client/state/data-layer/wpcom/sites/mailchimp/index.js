/**
 * External dependencies
 */

import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import {
	MAILCHIMP_LISTS_LIST,
	MAILCHIMP_LISTS_RECEIVE,
	MAILCHIMP_SETTINGS_LIST,
	MAILCHIMP_SETTINGS_RECEIVE,
} from 'calypso/state/action-types';
import { mergeHandlers } from 'calypso/state/action-watchers/utils';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';

import { registerHandlers } from 'calypso/state/data-layer/handler-registry';

export const handleMailchimpListsList = dispatchRequest( {
	fetch: ( action ) =>
		http(
			{
				method: 'GET',
				path: `/sites/${ action.siteId }/mailchimp/lists`,
			},
			action
		),
	fromApi: function ( endpointResponse ) {
		return endpointResponse;
	},
	onSuccess: ( { siteId }, lists ) => ( {
		type: MAILCHIMP_LISTS_RECEIVE,
		siteId,
		lists,
	} ),
	onError: noop,
} );

export const handleMailchimpSettingsList = dispatchRequest( {
	fetch: ( action ) =>
		http(
			{
				method: 'GET',
				path: `/sites/${ action.siteId }/mailchimp/settings`,
			},
			action
		),
	fromApi: function ( endpointResponse ) {
		return endpointResponse;
	},
	onSuccess: ( { siteId }, settings ) => ( {
		type: MAILCHIMP_SETTINGS_RECEIVE,
		siteId,
		settings,
	} ),
	onError: noop,
} );

registerHandlers(
	'state/data-layer/wpcom/sites/mailchimp/index.js',
	mergeHandlers( {
		[ MAILCHIMP_LISTS_LIST ]: [ handleMailchimpListsList ],
		[ MAILCHIMP_SETTINGS_LIST ]: [ handleMailchimpSettingsList ],
	} )
);

export default {};
