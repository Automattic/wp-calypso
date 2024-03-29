/**
 */

import { translate } from 'i18n-calypso';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { bypassDataLayer } from 'calypso/state/data-layer/utils';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { READER_SITE_BLOCK } from 'calypso/state/reader/action-types';
import { unblockSite } from 'calypso/state/reader/site-blocks/actions';

export function requestSiteBlock( action ) {
	return http(
		{
			method: 'POST',
			apiVersion: '1.1',
			path: `/me/block/sites/${ action.payload.siteId }/new`,
			body: {}, // have to have an empty body to make wpcom-http happy
		},
		action
	);
}

export function fromApi( response ) {
	if ( ! response.success ) {
		throw new Error( 'Site block was unsuccessful', response );
	}
	return response;
}

export function receiveSiteBlock() {
	return successNotice( translate( 'The site has been successfully blocked.' ), {
		duration: 5000,
	} );
}

export const receiveSiteBlockError =
	( { payload: { siteId } } ) =>
	( dispatch ) => {
		dispatch( errorNotice( translate( 'Sorry, there was a problem blocking that site.' ) ) );
		dispatch( bypassDataLayer( unblockSite( siteId ) ) );
	};

registerHandlers( 'state/data-layer/wpcom/me/block/sites/new/index.js', {
	[ READER_SITE_BLOCK ]: [
		dispatchRequest( {
			fetch: requestSiteBlock,
			onSuccess: receiveSiteBlock,
			onError: receiveSiteBlockError,
			fromApi,
		} ),
	],
} );
