/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import * as api from 'woocommerce/woocommerce-services/api';
import {
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_ADDRESS_NORMALIZATION_IN_PROGRESS,
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_SET_NORMALIZED_ADDRESS,
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_ADDRESS_NORMALIZATION_COMPLETED,
} from '../action-types';
import * as NoticeActions from 'state/notices/actions';

export default ( orderId, siteId, dispatch, address, group ) => {
	dispatch( { type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_ADDRESS_NORMALIZATION_IN_PROGRESS, group, orderId, siteId } );
	return new Promise( ( resolve ) => {
		let error = null, fieldErrors = null;
		const setError = ( err ) => error = err;
		const setSuccess = ( json ) => {
			if ( json.field_errors ) {
				fieldErrors = json.field_errors;
				return;
			}
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
					completed: ! error,
					fieldErrors,
				} );
				if ( error ) {
					dispatch( NoticeActions.errorNotice(
						translate( 'Error validating %(group)s address: %(error)s', { args: { group, error } } )
					) );
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
