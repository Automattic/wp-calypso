/**
 * External dependencies
 */
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { JETPACK_PRODUCT_INSTALL_REQUEST } from 'state/action-types';
import { registerHandlers } from 'state/data-layer/handler-registry';

/**
 * Start the Jetpack product install process.
 *
 * @param   {object} action Action to start product install request.
 * @returns {object}        The dispatched action.
 */
export const startJetpackProductInstall = ( action ) =>
	http(
		{
			apiVersion: '1.1',
			method: 'POST',
			path: `/jetpack-blogs/${ action.siteId }/product-install`,
			body: {
				akismet_api_key: action.akismetKey,
				vaultpress_registration_key: action.vaultpressKey,
			},
		},
		action
	);

registerHandlers( 'state/data-layer/wpcom/jetpack-blogs/product-install', {
	[ JETPACK_PRODUCT_INSTALL_REQUEST ]: [
		dispatchRequest( {
			fetch: startJetpackProductInstall,
			onSuccess: noop,
			onError: noop,
		} ),
	],
} );
