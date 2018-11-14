/** @format */

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
	WOOCOMMERCE_SERVICES_SHIPPING_LABEL_ADDRESS_NORMALIZATION_COMPLETED,
} from '../action-types';
import * as NoticeActions from 'state/notices/actions';

export default ( orderId, siteId, dispatch, address, group ) => {
	dispatch( {
		type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_ADDRESS_NORMALIZATION_IN_PROGRESS,
		group,
		orderId,
		siteId,
	} );

	const setSuccess = resolve => json => {
		dispatch( {
			type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_ADDRESS_NORMALIZATION_COMPLETED,
			siteId,
			orderId,
			group,
			requestSuccess: true,
			fieldErrors: json.field_errors,
			normalized: json.normalized,
			isTrivialNormalization: json.is_trivial_normalization,
		} );

		resolve( json );
	};

	const setError = reject => error => {
		dispatch(
			NoticeActions.errorNotice(
				translate( 'Error validating %(group)s address: %(error)s', {
					args: { group, error },
				} )
			)
		);

		dispatch( {
			type: WOOCOMMERCE_SERVICES_SHIPPING_LABEL_ADDRESS_NORMALIZATION_COMPLETED,
			siteId,
			orderId,
			group,
			requestSuccess: false,
		} );

		reject( error );
	};

	const request = api.post( siteId, api.url.addressNormalization(), { address, type: group } );

	// Generate a new promise in order to reject unsuccessful requests
	return new Promise( ( resolve, reject ) => {
		request.then( setSuccess( resolve ) ).catch( setError( reject ) );
	} );
};
