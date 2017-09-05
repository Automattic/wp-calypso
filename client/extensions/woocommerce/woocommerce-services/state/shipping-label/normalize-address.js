/**
 * Internal dependencies
 */
import * as api from 'woocommerce/woocommerce-services/api';
import {
	exitPrintingFlow,
} from './actions';
import {
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_ADDRESS_NORMALIZATION_IN_PROGRESS,
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_NORMALIZED_ADDRESS,
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_ADDRESS_NORMALIZATION_COMPLETED,
} from '../action-types';

export default ( siteId, orderId, dispatch, address, group ) => {
	dispatch( { type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_ADDRESS_NORMALIZATION_IN_PROGRESS, group, siteId, orderId } );
	return new Promise( ( resolve ) => {
		let error = null;
		const setError = ( err ) => error = err;
		const setSuccess = ( json ) => {
			dispatch( {
				type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_NORMALIZED_ADDRESS,
				siteId,
				orderId,
				group,
				normalized: json.normalized,
				isTrivialNormalization: json.is_trivial_normalization,
			} );
		};
		const setIsSaving = ( saving ) => {
			if ( ! saving ) {
				dispatch( {
					type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_ADDRESS_NORMALIZATION_COMPLETED,
					siteId,
					orderId,
					group,
					error,
				} );
				if ( error ) {
					if ( 'rest_cookie_invalid_nonce' === error ) {
						dispatch( exitPrintingFlow( siteId, orderId, true ) );
					}

					console.error( error ); // eslint-disable-line no-console
				}
				setTimeout( () => resolve( ! error ), 0 );
			}
		};
		setIsSaving( true );
		api.post( siteId, api.url.addressNormalization(), { address, type: group } )
			.then( setSuccess )
			.catch( setError )
			.then( () => ( setIsSaving( false ) ) );
	} );
};
