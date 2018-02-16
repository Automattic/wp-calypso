/** @format */
/**
 * Internal dependencies
 */
import { HTTP_DATA_REQUEST, HTTP_DATA_TICK } from 'state/action-types';
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import { update } from './common';

const fetch = action => {
	update( action.id, 'pending' );

	return [
		{
			...action.fetch,
			onSuccess: action,
			onFailure: action,
			onProgress: action,
		},
		{ type: HTTP_DATA_TICK },
	];
};

const onFailure = ( action, error ) => {
	update( action.id, 'failure', error );

	return { type: HTTP_DATA_TICK };
};

const onSuccess = ( action, apiData ) => {
	try {
		const data = 'function' === typeof action.fromApi ? action.fromApi( apiData ) : apiData;

		update( action.id, 'success', data );

		return { type: HTTP_DATA_TICK };
	} catch ( e ) {
		return onFailure( action, e );
	}
};

export default {
	[ HTTP_DATA_REQUEST ]: [
		dispatchRequestEx( {
			fetch,
			onSuccess,
			onFailure,
		} ),
	],
};
