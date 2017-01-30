/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	READER_SITE_BLOCK_REQUEST,
	READER_SITE_BLOCK_REQUEST_SUCCESS,
	READER_SITE_BLOCK_REQUEST_FAILURE,
	READER_SITE_UNBLOCK_REQUEST,
	READER_SITE_UNBLOCK_REQUEST_SUCCESS,
	READER_SITE_UNBLOCK_REQUEST_FAILURE,
} from 'state/action-types';
import { createNotice } from 'state/notices/actions';

/**
 * Triggers a network request to block a site.
 *
 * @param  {Number} siteId Site ID
 * @return {Function} Action thunk
 */
export function requestSiteBlock( siteId ) {
	return ( dispatch ) => {
		dispatch( {
			type: READER_SITE_BLOCK_REQUEST,
			siteId
		} );

		return wpcom.undocumented().me().blockSite( siteId ).then( ( data ) => {
			dispatch( {
				type: READER_SITE_BLOCK_REQUEST_SUCCESS,
				siteId,
				data
			} );
		},
		( error ) => {
			dispatch( {
				type: READER_SITE_BLOCK_REQUEST_FAILURE,
				siteId,
				error
			} );

			dispatch( createNotice( 'is-error', translate( 'Sorry - there was a problem blocking that site.' ) ) );
		}
		);
	};
}

/**
 * Triggers a network request to unblock a site.
 *
 * @param  {Number} siteId Site ID
 * @return {Function} Action thunk
 */
export function requestSiteUnblock( siteId ) {
	return ( dispatch ) => {
		dispatch( {
			type: READER_SITE_UNBLOCK_REQUEST,
			siteId
		} );

		return wpcom.undocumented().me().unblockSite( siteId ).then( ( data ) => {
			dispatch( {
				type: READER_SITE_UNBLOCK_REQUEST_SUCCESS,
				siteId,
				data
			} );
		},
		( error ) => {
			dispatch( {
				type: READER_SITE_UNBLOCK_REQUEST_FAILURE,
				siteId,
				error
			} );

			dispatch( createNotice( 'is-error', translate( 'Sorry - there was a problem unblocking that site.' ) ) );
		}
		);
	};
}
