/**
 * External dependencies
 */
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { JETPACK_CONNECT_SAVE_SITE_TYPE } from 'state/action-types';
import { registerHandlers } from 'state/data-layer/handler-registry';

/**
 * Save the site type.
 *
 * @param   {object} action Save site type action.
 * @returns {object}        The dispatched action.
 */
export const saveSiteType = action =>
	http(
		{
			method: 'POST',
			apiNamespace: 'wpcom/v2',
			path: `/sites/${ action.siteId }/site-type`,
			body: {
				site_type: action.siteType,
			},
		},
		action
	);

registerHandlers( 'state/data-layer/wpcom/sites/site-type', {
	[ JETPACK_CONNECT_SAVE_SITE_TYPE ]: [
		dispatchRequest( {
			fetch: saveSiteType,
			onSuccess: noop,
			onError: noop,
		} ),
	],
} );
