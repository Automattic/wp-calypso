import makeJsonSchemaParser from 'calypso/lib/make-json-schema-parser';
import { JETPACK_PRODUCT_INSTALL_STATUS_REQUEST } from 'calypso/state/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { receiveJetpackProductInstallStatus } from 'calypso/state/jetpack-product-install/actions';
import schema from './schema';

const noop = () => {};

/**
 * Request the current Jetpack product install status.
 *
 * @param   {Object} action Action to request the product install status.
 * @returns {Object}        The dispatched action.
 */
export const requestJetpackProductInstallStatus = ( action ) =>
	http(
		{
			apiVersion: '1.1',
			method: 'GET',
			path: `/jetpack-blogs/${ action.siteId }/product-install-status`,
		},
		action
	);

/**
 * Dispatches a product install status receive action when the request succeeded.
 *
 * @param   {Object} action Redux action
 * @param   {number} action.siteId
 * @param   {Object} status Status as returned from the endpoint
 * @returns {Object} Dispatched product install status receive action
 */
export const handleRequestSuccess = ( { siteId }, status ) =>
	receiveJetpackProductInstallStatus( siteId, status );

registerHandlers( 'state/data-layer/wpcom/jetpack-blogs/product-install-status', {
	[ JETPACK_PRODUCT_INSTALL_STATUS_REQUEST ]: [
		dispatchRequest( {
			fetch: requestJetpackProductInstallStatus,
			onSuccess: handleRequestSuccess,
			onError: noop,
			fromApi: makeJsonSchemaParser( schema ),
		} ),
	],
} );
