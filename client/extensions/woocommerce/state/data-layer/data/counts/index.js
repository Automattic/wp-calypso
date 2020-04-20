/**
 * Internal dependencies
 */
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import request from 'woocommerce/state/sites/http-request';
import {
	fetchCountsFailure,
	fetchCountsSuccess,
} from 'woocommerce/state/sites/data/counts/actions';
import { WOOCOMMERCE_COUNT_REQUEST } from 'woocommerce/state/action-types';
import { verifyResponseHasData } from 'woocommerce/state/data-layer/utils';

export const fetch = ( action ) => {
	const { siteId } = action;
	return request( siteId, action ).get( 'data/counts' );
};

const onError = ( action, error ) => ( dispatch ) => {
	const { siteId } = action;
	dispatch( fetchCountsFailure( siteId, error ) );
};

const onSuccess = ( action, { data } ) => ( dispatch ) => {
	const { siteId } = action;
	dispatch( fetchCountsSuccess( siteId, data ) );
};

export default {
	[ WOOCOMMERCE_COUNT_REQUEST ]: [
		dispatchRequest( {
			fetch,
			onSuccess,
			onError,
			fromApi: verifyResponseHasData,
		} ),
	],
};
