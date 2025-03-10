import {
	PURCHASE_CANCELLATION_OFFER_REQUEST,
	PURCHASE_CANCELLATION_OFFER_RECEIVE,
	PURCHASE_CANCELLATION_OFFER_REQUEST_FAILURE,
	PURCHASE_CANCELLATION_OFFER_APPLY_SUCCESS,
	PURCHASE_CANCELLATION_OFFER_APPLY_FAILURE,
	PURCHASE_CANCELLATION_OFFER_APPLY,
} from 'calypso/state/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { noRetry } from 'calypso/state/data-layer/wpcom-http/pipeline/retry-on-failure/policies';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';

// API request to get the cancellation offers
const fetchCancellationOffers = ( action: { siteId: number; purchaseId: number } ) => {
	return http(
		{
			method: 'GET',
			path: '/cancellation-offers',
			apiNamespace: 'wpcom/v2',
			query: {
				site: action.siteId,
				purchase: action.purchaseId,
			},
			retryPolicy: noRetry(),
		},
		action
	);
};

const onFetchSuccess = ( action: { purchaseId: number }, response: unknown ) => {
	return [
		{
			type: PURCHASE_CANCELLATION_OFFER_RECEIVE,
			purchaseId: action.purchaseId,
			offers: response,
		},
	];
};

const onFetchError = ( action: { purchaseId: number }, error: unknown ) => {
	return [
		{
			type: PURCHASE_CANCELLATION_OFFER_REQUEST_FAILURE,
			purchaseId: action.purchaseId,
			error,
		},
	];
};

const applyCancellationOffer = ( action: { siteId: number; purchaseId: number } ) => {
	return http(
		{
			method: 'POST',
			path: '/cancellation-offers/apply',
			apiNamespace: 'wpcom/v2',
			body: {
				site: action.siteId,
				purchase: action.purchaseId,
			},
		},
		action
	);
};

const onApplySuccess = ( action: { purchaseId: number }, response: { success: boolean } ) => {
	return [
		{
			type: PURCHASE_CANCELLATION_OFFER_APPLY_SUCCESS,
			purchaseId: action.purchaseId,
			success: response.success,
		},
	];
};

const onApplyFailure = ( action: { purchaseId: number }, error: unknown ) => {
	return [
		{
			type: PURCHASE_CANCELLATION_OFFER_APPLY_FAILURE,
			purchaseId: action.purchaseId,
			error,
		},
	];
};

registerHandlers( 'state/data-layer/wpcom/cancellation-offers/index.js', {
	[ PURCHASE_CANCELLATION_OFFER_REQUEST ]: [
		dispatchRequest( {
			fetch: fetchCancellationOffers,
			onSuccess: onFetchSuccess,
			onError: onFetchError,
		} ),
	],
	[ PURCHASE_CANCELLATION_OFFER_APPLY ]: [
		dispatchRequest( {
			fetch: applyCancellationOffer,
			onSuccess: onApplySuccess,
			onError: onApplyFailure,
		} ),
	],
} );
