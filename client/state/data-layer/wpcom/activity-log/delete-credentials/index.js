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
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import {
	JETPACK_CREDENTIALS_DELETE,
	JETPACK_CREDENTIALS_STORE,
	REWIND_STATE_UPDATE,
} from 'state/action-types';
import { transformApi } from 'state/data-layer/wpcom/sites/rewind/api-transformer';

import { registerHandlers } from 'state/data-layer/handler-registry';

export const request = action =>
	http(
		{
			apiVersion: '1.1',
			method: 'POST',
			path: `/activity-log/${ action.siteId }/delete-credentials`,
			body: { role: action.role },
		},
		{ ...action }
	);

export const success = ( { siteId }, { rewind_state } ) => {
	const storeAction = {
		type: JETPACK_CREDENTIALS_STORE,
		credentials: {
			main: null,
		},
		siteId,
	};

	// the API transform could fail and the rewind data might
	// be unavailable so if that's the case just let it go
	// for now. we'll improve our rigor as time goes by.
	try {
		return [
			storeAction,
			{
				type: REWIND_STATE_UPDATE,
				siteId,
				data: transformApi( rewind_state ),
			},
		];
	} catch ( e ) {
		return storeAction;
	}
};

registerHandlers( 'state/data-layer/wpcom/activity-log/delete-credentials/index.js', {
	[ JETPACK_CREDENTIALS_DELETE ]: [
		dispatchRequestEx( {
			fetch: request,
			onSuccess: success,
			onError: noop,
		} ),
	],
} );

export default {};
