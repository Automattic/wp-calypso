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
import {
	JETPACK_CREDENTIALS_DELETE,
	JETPACK_CREDENTIALS_STORE,
	REWIND_STATE_UPDATE,
} from 'state/action-types';
import { transformApi } from 'state/data-layer/wpcom/sites/rewind/api-transformer';

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

export const success = ( { dispatch }, { siteId }, { rewind_state } ) => {
	dispatch( {
		type: JETPACK_CREDENTIALS_STORE,
		credentials: {
			main: null,
		},
		siteId,
	} );

	// the API transform could fail and the rewind data might
	// be unavailable so if that's the case just let it go
	// for now. we'll improve our rigor as time goes by.
	try {
		dispatch( {
			type: REWIND_STATE_UPDATE,
			siteId,
			data: transformApi( rewind_state ),
		} );
	} catch ( e ) {}
};

export default {
	[ JETPACK_CREDENTIALS_DELETE ]: [ dispatchRequest( request, success, noop ) ],
};
