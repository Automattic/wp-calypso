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

const PURCHASES_FETCH_ERROR_MESSAGE = i18n.translate( 'There was an error retrieving purchases.' );

function cancelPurchase( purchaseId, onComplete ) {
	wpcom.cancelPurchase( purchaseId, ( error, data ) => {
		debug( error, data );

		const success = ! error && data.success;

		onComplete( success );
	} );
}

function cancelPrivateRegistration( purchaseId, onComplete ) {
	Dispatcher.handleViewAction( {
		type: ActionTypes.PURCHASES_PRIVATE_REGISTRATION_CANCEL,
		purchaseId
	} );

	wpcom.cancelPrivateRegistration( purchaseId, ( error, data ) => {
		debug( error, data );

		const canceledSuccessfully = ! error && data.success;

		if ( canceledSuccessfully ) {
			Dispatcher.handleServerAction( {
				type: ActionTypes.PURCHASES_PRIVATE_REGISTRATION_CANCEL_COMPLETED,
				purchaseId
			} );
		} else {
			Dispatcher.handleServerAction( {
				type: ActionTypes.PURCHASES_PRIVATE_REGISTRATION_CANCEL_FAILED,
				purchaseId,
				error: i18n.translate( 'There was a problem canceling this private registration. ' +
						'Please try again later or contact support.' )
			} );
		}

		onComplete( canceledSuccessfully );
	} );
}

function deleteStoredCard( card, onComplete ) {
	Dispatcher.handleViewAction( {
		type: ActionTypes.STORED_CARDS_DELETE,
		card
	} );

	wpcom.me().storedCardDelete( card, ( error, data ) => {
		let success = false;

		if ( data ) {
			Dispatcher.handleServerAction( {
				type: ActionTypes.STORED_CARDS_DELETE_COMPLETED,
				card
			} );

			success = true;
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
	function receiveSitePurchases( error, data ) {
		if ( error ) {
			Dispatcher.handleServerAction( {
				type: ActionTypes.PURCHASES_SITE_FETCH_FAILED,
				error: PURCHASES_FETCH_ERROR_MESSAGE
			} );
		} else {
			Dispatcher.handleServerAction( {
				type: ActionTypes.PURCHASES_SITE_FETCH_COMPLETED,
				siteId,
				purchases: purchasesAssembler.createPurchasesArray( data.upgrades )
			} );
		}
	}

	Dispatcher.handleViewAction( {
		type: ActionTypes.PURCHASES_SITE_FETCH,
		siteId
	} );

	wpcom.siteUpgrades( siteId, receiveSitePurchases );
}

function fetchStoredCards() {
	Dispatcher.handleViewAction( {
		type: ActionTypes.STORED_CARDS_FETCH
	} );

	wpcom.getStoredCards( ( error, data ) => {
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

function fetchUserPurchases() {
	Dispatcher.handleViewAction( {
		type: ActionTypes.PURCHASES_USER_FETCH
	} );

	wpcom.me().purchases( ( error, data ) => {
		const purchases = purchasesAssembler.createPurchasesArray( data );

		debug( purchases );

		if ( error ) {
			Dispatcher.handleServerAction( {
				type: ActionTypes.PURCHASES_USER_FETCH_FAILED,
				error: PURCHASES_FETCH_ERROR_MESSAGE
			} );
		} else {
			Dispatcher.handleServerAction( {
				type: ActionTypes.PURCHASES_USER_FETCH_COMPLETED,
				purchases
			} );
		}
	} );
}

export {
	cancelPurchase,
	cancelPrivateRegistration,
	deleteStoredCard,
	fetchSitePurchases,
	fetchStoredCards,
	fetchUserPurchases
};
