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
import { READER_SITE_BLOCK } from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { errorNotice, successNotice } from 'state/notices/actions';
import { unblockSite } from 'state/reader/site-blocks/actions';
import { bypassDataLayer } from 'state/data-layer/utils';

export function requestSiteBlock( { dispatch }, action ) {
	dispatch(
		http(
			{
				method: 'POST',
				apiVersion: '1.1',
				path: `/me/block/sites/${ action.payload.siteId }/new`,
				body: {}, // have to have an empty body to make wpcom-http happy
			},
			action
		)
	);
}

export function receiveSiteBlock( store, action, response ) {
	// validate that it worked
	const isBlocked = !! ( response && response.success );
	if ( ! isBlocked ) {
		receiveSiteBlockError( store, action );
		return;
	}

	store.dispatch(
		successNotice( translate( 'The site has been successfully blocked.' ), {
			duration: 5000,
		} )
	);
}

export function receiveSiteBlockError( { dispatch }, { payload: { siteId } } ) {
	dispatch( errorNotice( translate( 'Sorry, there was a problem blocking that site.' ) ) );
	dispatch( bypassDataLayer( unblockSite( siteId ) ) );
}

export default {
	[ READER_SITE_BLOCK ]: [
		dispatchRequest( requestSiteBlock, receiveSiteBlock, receiveSiteBlockError ),
	],
};
