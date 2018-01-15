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

export default mergeHandlers( index, notificationSubscriptions, posts );
