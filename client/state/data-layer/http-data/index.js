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

const onError = ( action, error ) => {
	update( action.id, 'failure', error );

	return { type: HTTP_DATA_TICK };
};

/**
 * Transforms API response data into storable data
 * Returns pairs of data ids and data plus an error indicator
 *
 * [ error?, [ [ id, data ], [ id, data ], … ] ]
 *
 * @example:
 *   --input--
 *   { data: { sites: {
 *     14: { is_active: true, name: 'foo' },
 *     19: { is_active: false, name: 'bar' }
 *   } } }
 *
 *   --output--
 *   [ [ 'site-names-14', 'foo' ] ]
 *
 * @param {*} data input data from API response
 * @param {function} fromApi transforms API response data
 * @return {Array<boolean, Array<Array<string, *>>>} output data to store
 */
const parseResponse = ( data, fromApi ) => {
	try {
		return [ undefined, fromApi( data ) ];
	} catch ( error ) {
		return [ error, undefined ];
	}
};

const onSuccess = ( action, apiData ) => {
	const [ error, data ] =
		'function' === typeof apiData ? parseResponse( apiData, action.fromApi ) : [ undefined, [] ];

	if ( undefined !== error ) {
		return onError( action, error );
	}

	update( action.id, 'success', apiData );
	data.forEach( ( [ id, resource ] ) => update( id, 'success', resource ) );

	return { type: HTTP_DATA_TICK };
};

export default {
	[ HTTP_DATA_REQUEST ]: [
		dispatchRequestEx( {
			fetch,
			onSuccess,
			onError,
		} ),
	],
};
