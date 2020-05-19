/**
 * External dependencies
 */
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import {
	PURCHASES_REMOVE,
	PURCHASES_SITE_FETCH,
	PURCHASES_SITE_FETCH_COMPLETED,
	PURCHASES_SITE_FETCH_FAILED,
	PURCHASES_USER_FETCH,
	PURCHASES_USER_FETCH_COMPLETED,
	PURCHASES_USER_FETCH_FAILED,
	PURCHASE_REMOVE_COMPLETED,
	PURCHASE_REMOVE_FAILED,
} from 'state/action-types';
import { requestHappychatEligibility } from 'state/happychat/user/actions';

import wp from 'lib/wp';
const wpcom = wp.undocumented();

const PURCHASES_FETCH_ERROR_MESSAGE = i18n.translate( 'There was an error retrieving purchases.' );
const PURCHASE_REMOVE_ERROR_MESSAGE = i18n.translate( 'There was an error removing the purchase.' );

export const clearPurchases = () => ( dispatch ) => {
	dispatch( { type: PURCHASES_REMOVE } );
	dispatch( requestHappychatEligibility() );
};

export const fetchSitePurchases = ( siteId ) => ( dispatch ) => {
	dispatch( {
		type: PURCHASES_SITE_FETCH,
		siteId,
	} );

	return new Promise( ( resolve, reject ) => {
		wpcom.sitePurchases( siteId, ( error, data ) => {
			error ? reject( error ) : resolve( data );
		} );
	} )
		.then( ( data ) => {
			dispatch( {
				type: PURCHASES_SITE_FETCH_COMPLETED,
				siteId,
				purchases: data,
			} );
		} )
		.catch( () => {
			dispatch( {
				type: PURCHASES_SITE_FETCH_FAILED,
				error: PURCHASES_FETCH_ERROR_MESSAGE,
			} );
		} );
};

export const fetchUserPurchases = ( userId ) => ( dispatch ) => {
	dispatch( {
		type: PURCHASES_USER_FETCH,
	} );

	return new Promise( ( resolve, reject ) => {
		wpcom.me().purchases( ( error, data ) => {
			error ? reject( error ) : resolve( data );
		} );
	} )
		.then( ( data ) => {
			dispatch( {
				type: PURCHASES_USER_FETCH_COMPLETED,
				purchases: data,
				userId,
			} );
		} )
		.catch( () => {
			dispatch( {
				type: PURCHASES_USER_FETCH_FAILED,
				error: PURCHASES_FETCH_ERROR_MESSAGE,
			} );
		} );
};

export const removePurchase = ( purchaseId, userId ) => ( dispatch ) => {
	return new Promise( ( resolve, reject ) => {
		wpcom.me().deletePurchase( purchaseId, ( error, data ) => {
			error ? reject( error ) : resolve( data );
		} );
	} )
		.then( ( data ) => {
			dispatch( {
				type: PURCHASE_REMOVE_COMPLETED,
				purchases: data.purchases,
				userId,
			} );

			dispatch( requestHappychatEligibility() );
		} )
		.catch( ( error ) => {
			dispatch( {
				type: PURCHASE_REMOVE_FAILED,
				error: error.message || PURCHASE_REMOVE_ERROR_MESSAGE,
			} );
		} );
};
