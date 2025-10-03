/**
 */

import { translate } from 'i18n-calypso';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { bypassDataLayer } from 'calypso/state/data-layer/utils';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { READER_SITE_UNBLOCK } from 'calypso/state/reader/action-types';
import { blockSite } from 'calypso/state/reader/site-blocks/actions';

export function requestSiteUnblock( action ) {
	return http(
		{
			method: 'POST',
			apiVersion: '1.1',
			path: `/me/block/sites/${ action.payload.siteId }/delete`,
			body: {}, // have to have an empty body to make wpcom-http happy
		},
		action
	);
}

export function fromApi( response ) {
	// don't need to check for existence of response because errors are handled
	if ( ! response.success ) {
		throw new Error( 'Site unblock was unsuccessful', response );
	}
	return response;
}

export function receiveSiteUnblock() {
	return successNotice( translate( 'The site has been successfully unblocked.' ), {
		duration: 5000,
	} );
}

// need to dispatch multiple times so use a redux-thunk
export const receiveSiteUnblockError =
	( { payload: { siteId } } ) =>
	( dispatch ) => {
		dispatch( errorNotice( translate( 'Sorry, there was a problem unblocking that site.' ) ) );
		dispatch( bypassDataLayer( blockSite( siteId ) ) );
	};

registerHandlers( 'state/data-layer/wpcom/me/block/sites/delete/index.js', {
	[ READER_SITE_UNBLOCK ]: [
		dispatchRequest( {
			fetch: requestSiteUnblock,
			onSuccess: receiveSiteUnblock,
			onError: receiveSiteUnblockError,
			fromApi,
		} ),
	],
} );
