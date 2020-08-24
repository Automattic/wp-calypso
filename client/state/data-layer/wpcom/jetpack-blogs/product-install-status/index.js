/**
 * External dependencies
 */
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import makeJsonSchemaParser from 'lib/make-json-schema-parser';
import schema from './schema';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { JETPACK_PRODUCT_INSTALL_STATUS_REQUEST } from 'state/action-types';
import { receiveJetpackProductInstallStatus } from 'state/jetpack-product-install/actions';
import { registerHandlers } from 'state/data-layer/handler-registry';

/**
 * Request the current Jetpack product install status.
 *
 * @param   {object} action Action to request the product install status.
 * @returns {object}        The dispatched action.
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
 * @param   {object} action Redux action
 * @param   {object} status Status as returned from the endpoint
 * @returns {object} Dispatched product install status receive action
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
