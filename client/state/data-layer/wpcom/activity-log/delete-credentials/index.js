/**
 * External dependencies
 *
 * @format
 */
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { JETPACK_CREDENTIALS_DELETE, JETPACK_CREDENTIALS_STORE } from 'state/action-types';

export const request = ( { dispatch }, action ) => {
	dispatch(
		http(
			{
				apiVersion: '1.1',
				method: 'POST',
				path: `/activity-log/${ action.siteId }/delete-credentials`,
				body: { role: action.role },
			},
			{ ...action }
		)
	);
};

export const success = ( { dispatch }, action ) => {
	dispatch( {
		type: JETPACK_CREDENTIALS_STORE,
		credentials: {
			main: null,
		},
		siteId: action.siteId,
	} );
};

export default {
	[ JETPACK_CREDENTIALS_DELETE ]: [ dispatchRequest( request, success, noop ) ],
};
