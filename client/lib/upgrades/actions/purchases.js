/**
 * External dependencies
 */
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import { action as ActionTypes } from '../constants';
import Dispatcher from 'dispatcher';
import i18n from 'lib/mixins/i18n';
import purchasesAssembler from 'lib/purchases/assembler';
import wp from 'lib/wp';

const debug = debugFactory( 'calypso:upgrades:actions:purchases' ),
	wpcom = wp.undocumented();

const PURCHASES_FETCH_ERROR_MESSAGE = i18n.translate( 'There was an error retrieving purchases.' ),
	PURCHASE_REMOVE_ERROR_MESSAGE = i18n.translate( 'There was an error removing the purchase.' );

function cancelPurchase( purchaseId, onComplete ) {
	wpcom.cancelPurchase( purchaseId, ( error, data ) => {
		debug( error, data );

		const success = ! error && data.success;

		if ( success ) {
			clearPurchases();
		}

		onComplete( success );
	} );
}

function cancelPrivateRegistration( purchaseId, onComplete ) {
	Dispatcher.handleViewAction( {
		type: ActionTypes.PRIVACY_PROTECTION_CANCEL,
		purchaseId
	} );

	wpcom.cancelPrivateRegistration( purchaseId, ( error, data ) => {
		debug( error, data );

		const success = ! error && data.success;

		if ( success ) {
			Dispatcher.handleServerAction( {
				type: ActionTypes.PRIVACY_PROTECTION_CANCEL_COMPLETED,
				purchase: purchasesAssembler.createPurchaseObject( data.upgrade )
			} );
		} else {
			Dispatcher.handleServerAction( {
				type: ActionTypes.PRIVACY_PROTECTION_CANCEL_FAILED,
				purchaseId,
				error: error.message || i18n.translate( 'There was a problem canceling this private registration. Please try again later or contact support.' )
			} );
		}

		onComplete( success );
	} );
}

function clearPurchases() {
	Dispatcher.handleViewAction( {
		type: ActionTypes.PURCHASES_REMOVE
	} );
}

function deleteStoredCard( card, onComplete ) {
	Dispatcher.handleViewAction( {
		type: ActionTypes.STORED_CARDS_DELETE,
		card
	} );

	wpcom.me().storedCardDelete( card, ( error, data ) => {
		debug( error, data );

		const success = Boolean( data );

		if ( success ) {
			Dispatcher.handleServerAction( {
				type: ActionTypes.STORED_CARDS_DELETE_COMPLETED,
				card
			} );
		} else {
			Dispatcher.handleServerAction( {
				type: ActionTypes.STORED_CARDS_DELETE_FAILED,
				error: error.message || i18n.translate( 'There was a problem deleting the stored card. Please try again later or contact support.' )
			} );
		}

		onComplete( success );
	} );
}

function fetchSitePurchases( siteId ) {
	Dispatcher.handleViewAction( {
		type: ActionTypes.PURCHASES_SITE_FETCH,
		siteId
	} );

	wpcom.sitePurchases( siteId, ( error, data ) => {
		debug( error, data );

		if ( error ) {
			Dispatcher.handleServerAction( {
				type: ActionTypes.PURCHASES_SITE_FETCH_FAILED,
				error: PURCHASES_FETCH_ERROR_MESSAGE
			} );
		} else {
			Dispatcher.handleServerAction( {
				type: ActionTypes.PURCHASES_SITE_FETCH_COMPLETED,
				siteId,
				purchases: purchasesAssembler.createPurchasesArray( data )
			} );
		}
	} );
}

function fetchStoredCards() {
	Dispatcher.handleViewAction( {
		type: ActionTypes.STORED_CARDS_FETCH
	} );

	wpcom.getStoredCards( ( error, data ) => {
		debug( error, data );

		if ( data ) {
			Dispatcher.handleServerAction( {
				type: ActionTypes.STORED_CARDS_FETCH_COMPLETED,
				list: data
			} );
		} else if ( error ) {
			Dispatcher.handleServerAction( {
				type: ActionTypes.STORED_CARDS_FETCH_FAILED,
				error: error.message || i18n.translate( 'There was a problem retrieving stored cards. Please try again later or contact support.' )
			} );
		}
	} );
}

function fetchUserPurchases( userId ) {
	Dispatcher.handleViewAction( {
		type: ActionTypes.PURCHASES_USER_FETCH
	} );

	wpcom.me().purchases( ( error, data ) => {
		debug( error, data );

		if ( error ) {
			Dispatcher.handleServerAction( {
				type: ActionTypes.PURCHASES_USER_FETCH_FAILED,
				error: PURCHASES_FETCH_ERROR_MESSAGE
			} );
		} else {
			Dispatcher.handleServerAction( {
				type: ActionTypes.PURCHASES_USER_FETCH_COMPLETED,
				purchases: purchasesAssembler.createPurchasesArray( data ),
				userId
			} );
		}
	} );
}

function removePurchase( purchaseId, userId, onComplete ) {
	Dispatcher.handleViewAction( {
		type: ActionTypes.PURCHASE_REMOVE,
		purchaseId
	} );

	wpcom.me().deletePurchase( purchaseId, ( error, data ) => {
		if ( error ) {
			Dispatcher.handleServerAction( {
				type: ActionTypes.PURCHASE_REMOVE_FAILED,
				error: error.message || PURCHASE_REMOVE_ERROR_MESSAGE
			} );
		} else {
			Dispatcher.handleServerAction( {
				type: ActionTypes.PURCHASE_REMOVE_COMPLETED,
				purchases: purchasesAssembler.createPurchasesArray( data.purchases ),
				userId
			} );
		}

		onComplete( data && data.success );
	} );
}

export {
	cancelPurchase,
	cancelPrivateRegistration,
	clearPurchases,
	deleteStoredCard,
	fetchSitePurchases,
	fetchStoredCards,
	fetchUserPurchases,
	removePurchase
};
