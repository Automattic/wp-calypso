/** @format */

/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import { errorNotice } from 'state/notices/actions';
import { setSourcePaymentTransactionDetail } from 'state/transactions/source-payment/actions';
import { SOURCE_PAYMENT_TRANSACTION_DETAIL_FETCH } from 'state/action-types';
import fromApi from './from-api';

export const fetchSourcePaymentTransactionDetail = action =>
	http(
		{
			method: 'GET',
			path: `/me/transactions/source-payment/${ action.orderId }`,
			apiNamespace: 'rest/v1',
		},
		action
	);

export const onSuccess = ( { orderId }, detail ) =>
	setSourcePaymentTransactionDetail( orderId, detail );

export const onError = () =>
	errorNotice(
		translate( 'We have problems fetching your payment status. Please try again later.' )
	);

export default {
	[ SOURCE_PAYMENT_TRANSACTION_DETAIL_FETCH ]: [
		dispatchRequestEx( {
			fetch: fetchSourcePaymentTransactionDetail,
			onSuccess,
			onError,
			fromApi,
		} ),
	],
};
