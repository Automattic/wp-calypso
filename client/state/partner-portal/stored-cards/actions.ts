import i18n from 'i18n-calypso';
import { wpcomJetpackLicensing as wpcomJpl } from 'calypso/lib/wp';
import type { PaymentMethod } from 'calypso/jetpack-cloud/sections/partner-portal/payment-methods';
import type { AnyAction, Dispatch } from 'redux';

import 'calypso/state/partner-portal/stored-cards/init';

export const fetchStoredCards = ( paging: { startingAfter: string; endingBefore: string } ) => (
	dispatch: Dispatch< AnyAction >
) => {
	dispatch( {
		type: 'STORED_CARDS_FETCH',
	} );

	return wpcomJpl.req
		.get(
			{
				apiNamespace: 'wpcom/v2',
				path: '/jetpack-licensing/stripe/payment-methods',
			},
			{ starting_after: paging.startingAfter, ending_before: paging.endingBefore }
		)
		.then( ( data: { items: PaymentMethod[]; has_more: boolean } ) => {
			dispatch( {
				type: 'STORED_CARDS_HAS_MORE_ITEMS',
				hasMore: data.has_more,
			} );

			dispatch( {
				type: 'STORED_CARDS_FETCH_COMPLETED',
				list: data.items,
			} );
		} )
		.catch( ( error: Error ) => {
			dispatch( {
				type: 'STORED_CARDS_FETCH_FAILED',
				error: error.message || i18n.translate( 'There was a problem retrieving stored cards.' ),
			} );

			return Promise.reject( error );
		} );
};

export const deleteStoredCard = ( card: PaymentMethod, primaryPaymentMethodId?: string ) => (
	dispatch: Dispatch< AnyAction >
) => {
	dispatch( {
		type: 'STORED_CARDS_DELETE',
		card,
	} );

	return wpcomJpl.req
		.post( {
			method: 'DELETE',
			apiNamespace: 'wpcom/v2',
			path: '/jetpack-licensing/stripe/payment-method',
			body: { payment_method_id: card.id, primary_payment_method_id: primaryPaymentMethodId },
		} )
		.then( ( response: { success: boolean; primary_payment_method_id: string } ) => {
			dispatch( {
				type: 'STORED_CARDS_DELETE_COMPLETED',
				card,
			} );

			dispatch( {
				type: 'STORED_CARDS_UPDATE_IS_PRIMARY_COMPLETED',
				payment_method_id: response.primary_payment_method_id,
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
