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

const parseResponse = ( data, fromApi ) => {
	if ( 'function' !== typeof fromApi ) {
		return data;
	}

	// [ error, data ]
	try {
		return [ undefined, fromApi( data ) ];
	} catch ( error ) {
		return [ error, undefined ];
	}
};

const onSuccess = ( action, apiData ) => {
	const [ error, data ] = parseResponse( apiData, action.fromApi );

	if ( undefined !== error ) {
		return onFailure( action, error );
	}

	if ( 'multi-resource' === action.fromApiType ) {
		data.forEach( ( [ id, resource ] ) => update( id, 'success', resource ) );
	} else {
		update( action.id, 'success', data );
	}

	return { type: HTTP_DATA_TICK };
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
