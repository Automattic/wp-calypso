/**
 * @format
 */

/**
 * External Dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import { READER_SITE_UNBLOCK } from 'client/state/action-types';
import { http } from 'client/state/data-layer/wpcom-http/actions';
import { dispatchRequestEx } from 'client/state/data-layer/wpcom-http/utils';
import { errorNotice, plainNotice } from 'client/state/notices/actions';
import { blockSite } from 'client/state/reader/site-blocks/actions';
import { bypassDataLayer } from 'client/state/data-layer/utils';

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
	return plainNotice( translate( 'The site has been successfully unblocked.' ), {
		duration: 5000,
	} );
}

// need to dispatch multiple times so use a redux-thunk
export const receiveSiteUnblockError = ( { payload: { siteId } } ) => dispatch => {
	dispatch( errorNotice( translate( 'Sorry, there was a problem unblocking that site.' ) ) );
	dispatch( bypassDataLayer( blockSite( siteId ) ) );
};

export default {
	[ READER_SITE_UNBLOCK ]: [
		dispatchRequestEx( {
			fetch: requestSiteUnblock,
			onSuccess: receiveSiteUnblock,
			onError: receiveSiteUnblockError,
			fromApi,
		} ),
	],
};
