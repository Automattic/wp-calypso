/**
 * External dependencies
 */
import { mapValues } from 'lodash';

/**
 * Internal dependencies
 */
import * as api from 'woocommerce/woocommerce-services/api';
import {
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_RATES_RETRIEVAL_IN_PROGRESS,
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_RATES,
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_RATES_RETRIEVAL_COMPLETED,
} from '../action-types';

export default ( orderId, siteId, dispatch, origin, destination, packages ) => {
	const requestData = { origin, destination, packages };
	dispatch( {
		type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_RATES_RETRIEVAL_IN_PROGRESS,
		requestData,
		siteId,
		orderId,
	} );

	return new Promise( ( resolve, reject ) => {
		let error = null;
		const setError = ( err ) => ( error = err );
		const setSuccess = ( json ) => {
			dispatch( {
				type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_RATES,
				rates: mapValues( json.rates, ( pckg ) => ( 'rates' in pckg ? pckg : pckg.default)  ),
				requestData,
				siteId,
				orderId,
			} );
		};
		const setIsSaving = ( saving ) => {
			if ( ! saving ) {
				dispatch( {
					type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_RATES_RETRIEVAL_COMPLETED,
					requestData,
					siteId,
					orderId,
				} );
				if ( error ) {
					setTimeout( () => reject( error ), 0 );
				} else {
					setTimeout( resolve, 0 );
				}
			}
		};

		setIsSaving( true );
		api
			.post( siteId, api.url.getLabelRates( orderId ), requestData )
			.then( setSuccess )
			.catch( setError )
			.then( () => setIsSaving( false ) );
	} );
};
