import {
	PURCHASE_CANCELLATION_OFFER_REQUEST,
	PURCHASE_CANCELLATION_OFFER_RECEIVE,
	PURCHASE_CANCELLATION_OFFER_REQUEST_FAILURE,
} from 'calypso/state/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';

// API request to get the cancellation offers
const fetchCancellationOffers = ( action: { siteId: number; purchaseId: number } ) => {
	return http(
		{
			method: 'GET',
			path: `/cancellation-offers`,
			apiNamespace: 'wpcom/v2',
			query: {
				site: action.siteId,
				purchase: action.purchaseId,
			},
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

registerHandlers( 'state/data-layer/wpcom/cancellation-offers/index.js', {
	[ PURCHASE_CANCELLATION_OFFER_REQUEST ]: [
		dispatchRequest( {
			fetch: fetchCancellationOffers,
			onSuccess: onFetchSuccess,
			onError: onFetchError,
		} ),
	],
} );
