/**
 * External dependencies
 */
import debugFactory from 'debug';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { action as ActionTypes } from '../constants';
import Dispatcher from 'dispatcher';
import olark from 'lib/olark';
import purchasesAssembler from 'lib/purchases/assembler';
import wp from 'lib/wp';

const debug = debugFactory( 'calypso:upgrades:actions:purchases' ),
	wpcom = wp.undocumented();

const PURCHASES_FETCH_ERROR_MESSAGE = i18n.translate( 'There was an error retrieving purchases.' );

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

function clearPurchases() {
	Dispatcher.handleViewAction( {
		type: ActionTypes.PURCHASES_REMOVE
	} );

	olark.updateOlarkGroupAndEligibility();
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
				error: error.message || i18n.translate( 'There was a problem deleting the stored card.' )
			} );
		}

		onComplete( success );
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
				error: error.message || i18n.translate( 'There was a problem retrieving stored cards.' )
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

function cancelAndRefundPurchase( purchaseId, data, onComplete ) {
	wpcom.cancelAndRefundPurchase( purchaseId, data, function( error, response ) {
		if ( ! error ) {
			clearPurchases();
		}

		onComplete( error, response );
	} );
}

export {
	cancelAndRefundPurchase,
	cancelPurchase,
	clearPurchases,
	deleteStoredCard,
	fetchStoredCards,
	fetchUserPurchases
};
