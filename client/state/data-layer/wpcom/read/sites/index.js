/** @format */

/**
 * Internal Dependencies
 */
import { READER_SITE_REQUEST } from 'state/action-types';
import { mergeHandlers } from 'state/action-watchers/utils';
import notificationSubscriptions from './notification-subscriptions';
import posts from './posts';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import { bypassDataLayer } from 'state/data-layer/utils';
import {
	receiveReaderSiteRequestSuccess,
	receiveReaderSiteRequestFailure,
} from 'state/reader/sites/actions';
import { fields } from 'state/reader/sites/fields';
import { noRetry } from 'state/data-layer/wpcom-http/pipeline/retry-on-failure/policies';

import { registerHandlers } from 'state/data-layer/handler-registry';

export function requestReadSite( action ) {
	return http(
		{
			apiVersion: '1.1',
			method: 'GET',
			path: `/read/sites/${ action.payload.ID }`,
			query: {
				fields: fields.join( ',' ),
				options: [ 'is_mapped_domain', 'unmapped_url', 'is_redirect' ].join( ',' ),
			},
			retryPolicy: noRetry(),
		},
		action
	);
}

export function receiveReadSiteSuccess( action, response ) {
	return bypassDataLayer( receiveReaderSiteRequestSuccess( response ) );
}

export function receiveReadSiteError( action, response ) {
	return bypassDataLayer( receiveReaderSiteRequestFailure( action, response ) );
}

const index = {
	[ READER_SITE_REQUEST ]: [
		dispatchRequestEx( {
			fetch: requestReadSite,
			onSuccess: receiveReadSiteSuccess,
			onError: receiveReadSiteError,
		} ),
	],
};

registerHandlers(
	'state/data-layer/wpcom/read/sites/index.js',
	mergeHandlers( index, notificationSubscriptions, posts )
);

export default {};
