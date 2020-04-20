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

	const setSuccess = ( json ) => {
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
	};

	const setError = ( error ) => {
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

		throw error;
	};

	return api
		.post( siteId, api.url.addressNormalization(), { address, type: group } )
		.then( setSuccess )
		.catch( setError );
};
