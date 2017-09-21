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

export default ( siteId, orderId, dispatch, origin, destination, packages ) => {
	dispatch( { siteId, orderId, type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_RATES_RETRIEVAL_IN_PROGRESS } );
	return new Promise( ( resolve, reject ) => {
		let error = null;
		const setError = ( err ) => error = err;
		const setSuccess = ( json ) => {
			dispatch( {
				type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_RATES,
				rates: json.rates,
				siteId,
				orderId,
			} );
		};
		const setIsSaving = ( saving ) => {
			if ( ! saving ) {
				dispatch( {
					type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_RATES_RETRIEVAL_COMPLETED,
					siteId,
					orderId,
				} );
				if ( 'rest_cookie_invalid_nonce' === error ) {
					dispatch( exitPrintingFlow( siteId, orderId, true ) );
				} else if ( error ) {
					setTimeout( () => reject( error ), 0 );
				} else {
					setTimeout( resolve, 0 );
				}
			}
		};

		setIsSaving( true );
		api.post( siteId, api.url.getLabelRates( orderId ), { origin, destination, packages } )
			.then( setSuccess )
			.catch( setError )
			.then( () => setIsSaving( false ) );
	} );
};
