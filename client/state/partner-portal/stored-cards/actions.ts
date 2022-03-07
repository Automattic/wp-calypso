import i18n from 'i18n-calypso';
import { wpcomJetpackLicensing as wpcomJpl } from 'calypso/lib/wp';
import type { PaymentMethod } from 'calypso/jetpack-cloud/sections/partner-portal/payment-methods';
import type { AnyAction, Dispatch } from 'redux';

import 'calypso/state/partner-portal/stored-cards/init';

export const fetchStoredCards = () => ( dispatch: Dispatch< AnyAction > ) => {
	dispatch( {
		type: 'STORED_CARDS_FETCH',
	} );

	return wpcomJpl.req
		.get( {
			apiNamespace: 'wpcom/v2',
			path: '/jetpack-licensing/stripe/payment-methods',
		} )
		.then( ( data: PaymentMethod[] ) => {
			dispatch( {
				type: 'STORED_CARDS_FETCH_COMPLETED',
				list: data,
			} );
		} )
		.catch( ( error: Error ) => {
			dispatch( {
				type: 'STORED_CARDS_FETCH_FAILED',
				error: error.message || i18n.translate( 'There was a problem retrieving stored cards.' ),
			} );
		} );
};

export const deleteStoredCard = ( card: PaymentMethod ) => ( dispatch: Dispatch< AnyAction > ) => {
	dispatch( {
		type: 'STORED_CARDS_DELETE',
		card,
	} );

	return wpcomJpl.req
		.post( {
			method: 'DELETE',
			apiNamespace: 'wpcom/v2',
			path: '/jetpack-licensing/stripe/payment-method',
			body: { payment_method_id: card.id },
		} )
		.then( () => {
			dispatch( {
				type: 'STORED_CARDS_DELETE_COMPLETED',
				card,
			} );
		} )
		.catch( ( error: Error ) => {
			dispatch( {
				type: 'STORED_CARDS_DELETE_FAILED',
				card,
				error: error.message || i18n.translate( 'There was a problem deleting the stored card.' ),
			} );

			return Promise.reject( error );
		} );
};
