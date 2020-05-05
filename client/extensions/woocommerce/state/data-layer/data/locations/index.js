/**
 * Internal dependencies
 */
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { locationsFailure, locationsReceive } from 'woocommerce/state/sites/data/locations/actions';
import request from 'woocommerce/state/sites/http-request';
import { WOOCOMMERCE_LOCATIONS_REQUEST } from 'woocommerce/state/action-types';

export const fetch = ( action ) => {
	const { siteId } = action;
	return request( siteId, action, '/wc/v3' ).get( 'data/continents' );
};

export const onSuccess = ( { siteId }, { data } ) => locationsReceive( siteId, data );

export const onError = ( { siteId }, error ) => locationsFailure( siteId, error );

export default {
	[ WOOCOMMERCE_LOCATIONS_REQUEST ]: [ dispatchRequest( { fetch, onSuccess, onError } ) ],
};
