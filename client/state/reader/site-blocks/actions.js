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
import { errorNotice } from 'state/notices/actions';

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

		return wpcom.undocumented().me().blockSite( siteId ).then( ( response ) => {
			if ( response && response.success === false ) {
				return Promise.reject( 'Block was unsuccessful' );
			}
			return response;
		} ).then( ( response ) => {
			dispatch( {
				type: READER_SITE_BLOCK_REQUEST_SUCCESS,
				siteId,
				data: response
			} );
		},
		( error ) => {
			dispatch( {
				type: READER_SITE_BLOCK_REQUEST_FAILURE,
				siteId,
				error
			} );

			dispatch( errorNotice( translate( 'Sorry, there was a problem blocking that site.' ) ) );

			return Promise.reject( error );
		} );
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

		return wpcom.undocumented().me().unblockSite( siteId ).then( ( response ) => {
			if ( response && response.success === false ) {
				return Promise.reject( 'Unblock was unsuccessful' );
			}
			return response;
		} ).then( ( response ) => {
			dispatch( {
				type: READER_SITE_UNBLOCK_REQUEST_SUCCESS,
				siteId,
				data: response
			} );
		},
		( error ) => {
			dispatch( {
				type: READER_SITE_UNBLOCK_REQUEST_FAILURE,
				siteId,
				error
			} );

			dispatch( errorNotice( translate( 'Sorry, there was a problem unblocking that site.' ) ) );

			return Promise.reject( error );
		} );
	};
}
