import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { bypassDataLayer } from 'calypso/state/data-layer/utils';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { noRetry } from 'calypso/state/data-layer/wpcom-http/pipeline/retry-on-failure/policies';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { READER_SITE_REQUEST } from 'calypso/state/reader/action-types';
import {
	receiveReaderSiteRequestSuccess,
	receiveReaderSiteRequestFailure,
} from 'calypso/state/reader/sites/actions';
import { fields } from 'calypso/state/reader/sites/fields';

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

registerHandlers( 'state/data-layer/wpcom/read/sites/index.js', {
	[ READER_SITE_REQUEST ]: [
		dispatchRequest( {
			fetch: requestReadSite,
			onSuccess: receiveReadSiteSuccess,
			onError: receiveReadSiteError,
		} ),
	],
} );
