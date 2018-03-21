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
import { SOURCE_PAYMENT_TRANSACTION_DETAIL_FETCH } from 'state/action-types';
import fromApi from './from-api';
import toApi from './to-api';

export const fetchSourcePaymentTransactionDetail = action =>
	http(
		{
			method: 'GET',
			path: '/me/transactions/source-payment',
			apiNamespace: 'wpcom/v1',
			body: toApi( action ),
		},
		action
	);

export const onSuccess = ( action, data ) => {
	console.log( '------------------', action, data );

	return {};
};

export const onError = ( action, data ) =>
	errorNotice( translate( 'Sorry. Something went wrong!' ) );

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
