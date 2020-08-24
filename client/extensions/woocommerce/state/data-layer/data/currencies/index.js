/**
 * Internal dependencies
 */
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import {
	currenciesFailure,
	currenciesReceive,
} from 'woocommerce/state/sites/data/currencies/actions';
import request from 'woocommerce/state/sites/http-request';
import { WOOCOMMERCE_CURRENCIES_REQUEST } from 'woocommerce/state/action-types';

export const fetch = ( action ) => {
	const { siteId } = action;
	return request( siteId, action ).get( 'data/currencies' );
};

export const onSuccess = ( { siteId }, { data } ) => currenciesReceive( siteId, data );

export const onError = ( { siteId }, error ) => currenciesFailure( siteId, error );

export default {
	[ WOOCOMMERCE_CURRENCIES_REQUEST ]: [ dispatchRequest( { fetch, onSuccess, onError } ) ],
};
