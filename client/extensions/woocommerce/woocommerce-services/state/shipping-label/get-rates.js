/**
 * Internal dependencies
 */
import * as api from 'woocommerce/woocommerce-services/api';
import {
	exitPrintingFlow,
} from './actions';
import {
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_RATES_RETRIEVAL_IN_PROGRESS,
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_RATES,
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_RATES_RETRIEVAL_COMPLETED,
} from '../action-types';

export default ( dispatch, origin, destination, packages, orderId ) => {
	dispatch( { type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_RATES_RETRIEVAL_IN_PROGRESS } );
	return new Promise( ( resolve, reject ) => {
		let error = null;
		const setError = ( err ) => error = err;
		const setSuccess = ( json ) => {
			dispatch( {
				type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_RATES,
				rates: json.rates,
			} );
		};
		const setIsSaving = ( saving ) => {
			if ( ! saving ) {
				dispatch( {
					type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_RATES_RETRIEVAL_COMPLETED,
				} );
				if ( 'rest_cookie_invalid_nonce' === error ) {
					dispatch( exitPrintingFlow( true ) );
				} else if ( error ) {
					setTimeout( () => reject( error ), 0 );
				} else {
					setTimeout( resolve, 0 );
				}
			}
		};

		setIsSaving( true );
		api.post( api.url.getLabelRates( orderId ), { origin, destination, packages } )
			.then( setSuccess )
			.catch( setError )
			.then( () => setIsSaving( false ) );
	} );
};
