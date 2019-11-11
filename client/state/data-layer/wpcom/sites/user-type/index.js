/**
 * External dependencies
 */
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { JETPACK_CONNECT_SAVE_SITE_USER_TYPE } from 'state/action-types';
import { registerHandlers } from 'state/data-layer/handler-registry';

/**
 * Save the site's user type.
 *
 * @param   {object} action Save site's user type action.
 * @returns {object}        The dispatched action.
 */
export const saveSiteUserType = action =>
	http(
		{
			method: 'POST',
			apiNamespace: 'wpcom/v2',
			path: `/sites/${ action.siteId }/user-type`,
			body: {
				site_user_type: action.siteUserType,
			},
		},
		action
	);

registerHandlers( 'state/data-layer/wpcom/sites/user-type', {
	[ JETPACK_CONNECT_SAVE_SITE_USER_TYPE ]: [
		dispatchRequest( {
			fetch: saveSiteUserType,
			onSuccess: noop,
			onError: noop,
		} ),
	],
} );
