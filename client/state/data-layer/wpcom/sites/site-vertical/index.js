/**
 * External dependencies
 */
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { JETPACK_CONNECT_SAVE_SITE_VERTICAL } from 'state/action-types';
import { registerHandlers } from 'state/data-layer/handler-registry';

/**
 * Save the site vertical.
 *
 * @param   {object} action Save site vertical action.
 * @returns {object}        The dispatched action.
 */
export const saveSiteVertical = action =>
	http(
		{
			method: 'POST',
			apiNamespace: 'wpcom/v2',
			path: `/sites/${ action.siteId }/site-vertical`,
			body: {
				site_vertical: action.siteVertical,
			},
		},
		action
	);

registerHandlers( 'state/data-layer/wpcom/sites/site-vertical', {
	[ JETPACK_CONNECT_SAVE_SITE_VERTICAL ]: [
		dispatchRequest( {
			fetch: saveSiteVertical,
			onSuccess: noop,
			onError: noop,
		} ),
	],
} );
