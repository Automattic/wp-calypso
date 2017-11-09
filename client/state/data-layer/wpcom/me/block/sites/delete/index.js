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
import { READER_SITE_UNBLOCK } from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { errorNotice, plainNotice } from 'state/notices/actions';
import { blockSite } from 'state/reader/site-blocks/actions';
import { bypassDataLayer } from 'state/data-layer/utils';

export function requestSiteUnblock( { dispatch }, action ) {
	dispatch(
		http(
			{
				method: 'POST',
				apiVersion: '1.1',
				path: `/me/block/sites/${ action.payload.siteId }/delete`,
				body: {}, // have to have an empty body to make wpcom-http happy
			},
			action
		)
	);
}

export function receiveSiteUnblock( store, action, response ) {
	// validate that it worked
	const isUnblocked = !! ( response && response.success );
	if ( ! isUnblocked ) {
		receiveSiteUnblockError( store, action );
		return;
	}

	store.dispatch(
		plainNotice( translate( 'The site has been successfully unblocked.' ), {
			duration: 5000,
		} )
	);
}

export function receiveSiteUnblockError( { dispatch }, { payload: { siteId } } ) {
	dispatch( errorNotice( translate( 'Sorry, we had a problem unblocking that site.' ) ) );
	dispatch( bypassDataLayer( blockSite( siteId ) ) );
}

export default {
	[ READER_SITE_UNBLOCK ]: [
		dispatchRequest( requestSiteUnblock, receiveSiteUnblock, receiveSiteUnblockError ),
	],
};
