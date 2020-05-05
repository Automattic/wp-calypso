/**
 * External dependencies
 */
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import {
	STORED_CARDS_ADD_COMPLETED,
	STORED_CARDS_DELETE,
	STORED_CARDS_DELETE_COMPLETED,
	STORED_CARDS_DELETE_FAILED,
	STORED_CARDS_FETCH,
	STORED_CARDS_FETCH_COMPLETED,
	STORED_CARDS_FETCH_FAILED,
} from 'state/action-types';
import wp from 'lib/wp';

export const addStoredCard = ( cardData ) => ( dispatch ) => {
	return wp
		.undocumented()
		.me()
		.storedCardAdd( cardData.token, cardData.additionalData )
		.then( ( item ) => {
			dispatch( {
				type: STORED_CARDS_ADD_COMPLETED,
				item,
			} );
		} );
};

export const fetchStoredCards = () => ( dispatch ) => {
	dispatch( {
		type: STORED_CARDS_FETCH,
	} );

	return wp
		.undocumented()
		.getPaymentMethods()
		.then( ( data ) => {
			dispatch( {
				type: STORED_CARDS_FETCH_COMPLETED,
				list: data,
			} );
		} )
		.catch( ( error ) => {
			dispatch( {
				type: STORED_CARDS_FETCH_FAILED,
				error: error.message || i18n.translate( 'There was a problem retrieving stored cards.' ),
			} );
		} );
};

export const deleteStoredCard = ( card ) => ( dispatch ) => {
	dispatch( {
		type: STORED_CARDS_DELETE,
		card,
	} );

	return Promise.all(
		card.allStoredDetailsIds.map( ( storedDetailsId ) =>
			wp.undocumented().me().storedCardDelete( { stored_details_id: storedDetailsId } )
		)
	)
		.then( () => {
			dispatch( {
				type: STORED_CARDS_DELETE_COMPLETED,
				card,
			} );
		} )
		.catch( ( error ) => {
			dispatch( {
				type: STORED_CARDS_DELETE_FAILED,
				card,
				error: error.message || i18n.translate( 'There was a problem deleting the stored card.' ),
			} );
		} );
};
