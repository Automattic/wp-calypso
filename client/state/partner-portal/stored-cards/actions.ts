import i18n from 'i18n-calypso';
import { PaymentMethod } from 'calypso/jetpack-cloud/sections/partner-portal/payment-methods';
import { wpcomJetpackLicensing as wpcomJpl } from 'calypso/lib/wp';
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
		.catch( ( error: { message: string } ) => {
			dispatch( {
				type: 'STORED_CARDS_FETCH_FAILED',
				error: error.message || i18n.translate( 'There was a problem retrieving stored cards.' ),
			} );
		} );
};
