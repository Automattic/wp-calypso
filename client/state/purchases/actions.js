/** @format */
// External dependencies
import i18n from 'i18n-calypso';

// Internal dependencies
import olark from 'client/lib/olark';
import {
	PRIVACY_PROTECTION_CANCEL,
	PRIVACY_PROTECTION_CANCEL_COMPLETED,
	PRIVACY_PROTECTION_CANCEL_FAILED,
	PURCHASES_REMOVE,
	PURCHASES_SITE_FETCH,
	PURCHASES_SITE_FETCH_COMPLETED,
	PURCHASES_SITE_FETCH_FAILED,
	PURCHASES_USER_FETCH,
	PURCHASES_USER_FETCH_COMPLETED,
	PURCHASES_USER_FETCH_FAILED,
	PURCHASE_REMOVE_COMPLETED,
	PURCHASE_REMOVE_FAILED,
} from 'client/state/action-types';

import wp from 'client/lib/wp';
const wpcom = wp.undocumented();

const PURCHASES_FETCH_ERROR_MESSAGE = i18n.translate( 'There was an error retrieving purchases.' );
const PURCHASE_REMOVE_ERROR_MESSAGE = i18n.translate( 'There was an error removing the purchase.' );

export const cancelPrivacyProtection = purchaseId => dispatch => {
	dispatch( {
		type: PRIVACY_PROTECTION_CANCEL,
		purchaseId,
	} );

	return new Promise( ( resolve, reject ) => {
		wpcom.cancelPrivacyProtection( purchaseId, ( error, data ) => {
			error ? reject( error ) : resolve( data );
		} );
	} )
		.then( data => {
			dispatch( {
				type: PRIVACY_PROTECTION_CANCEL_COMPLETED,
				purchase: data.upgrade,
			} );
		} )
		.catch( error => {
			dispatch( {
				type: PRIVACY_PROTECTION_CANCEL_FAILED,
				purchaseId,
				error:
					error.message ||
					i18n.translate(
						'There was a problem canceling this privacy protection. ' +
							'Please try again later or contact support.'
					),
			} );
		} );
};

export const clearPurchases = () => {
	// TODO: we should call this olark method elsewhere, so that this
	// action creator doesn't have side effects.
	olark.updateOlarkGroupAndEligibility();

	return {
		type: PURCHASES_REMOVE,
	};
};

export const fetchSitePurchases = siteId => dispatch => {
	dispatch( {
		type: PURCHASES_SITE_FETCH,
		siteId,
	} );

	return new Promise( ( resolve, reject ) => {
		wpcom.sitePurchases( siteId, ( error, data ) => {
			error ? reject( error ) : resolve( data );
		} );
	} )
		.then( data => {
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

export const fetchUserPurchases = userId => dispatch => {
	dispatch( {
		type: PURCHASES_USER_FETCH,
	} );

	return new Promise( ( resolve, reject ) => {
		wpcom.me().purchases( ( error, data ) => {
			error ? reject( error ) : resolve( data );
		} );
	} )
		.then( data => {
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

export const removePurchase = ( purchaseId, userId ) => dispatch => {
	return new Promise( ( resolve, reject ) => {
		wpcom.me().deletePurchase( purchaseId, ( error, data ) => {
			error ? reject( error ) : resolve( data );
		} );
	} )
		.then( data => {
			dispatch( {
				type: PURCHASE_REMOVE_COMPLETED,
				purchases: data.purchases,
				userId,
			} );

			olark.updateOlarkGroupAndEligibility();
		} )
		.catch( error => {
			dispatch( {
				type: PURCHASE_REMOVE_FAILED,
				error: error.message || PURCHASE_REMOVE_ERROR_MESSAGE,
			} );
		} );
};
