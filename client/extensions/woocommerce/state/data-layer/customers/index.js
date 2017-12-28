/** @format */
/**
 * Internal dependencies
 */
import { dispatchRequestEx } from 'client/state/data-layer/wpcom-http/utils';
import {
	customersFailure,
	customersReceive,
} from 'client/extensions/woocommerce/state/sites/customers/actions';
import request from 'client/extensions/woocommerce/state/sites/http-request';
import { WOOCOMMERCE_CUSTOMERS_REQUEST } from 'client/extensions/woocommerce/state/action-types';

export const fetch = action => {
	const { siteId, searchTerm } = action;
	return request( siteId, action ).get( `customers?search=${ searchTerm }&per_page=50` );
};

export const onSuccess = ( { siteId, searchTerm }, { data } ) =>
	customersReceive( siteId, searchTerm, data );

export const onError = ( { siteId, searchTerm }, error ) =>
	customersFailure( siteId, searchTerm, error );

export default {
	[ WOOCOMMERCE_CUSTOMERS_REQUEST ]: [ dispatchRequestEx( { fetch, onSuccess, onError } ) ],
};
