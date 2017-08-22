/** @format */

/**
 * Internal Dependencies
 */
import { combineReducers } from 'state/utils';
import { TRACK_REQUEST } from 'state/action-types';
import { getRequestStatus } from 'state/data-layer/wpcom-http/utils';
import deterministicStringify from 'json-stable-stringify';

export const getActionKey = fullAction => {
	const { meta, ...action } = fullAction; // eslint-disable-line no-unused-vars

	return deterministicStringify( action );
};

const requestStatus = ( state = {}, action ) => {
	if ( action.type === TRACK_REQUEST ) {
		const { requestAction } = action;

		return {
			...state,
			[ getActionKey( requestAction ) ]: getRequestStatus( requestAction ),
		};
	}
	return state;
};

export default combineReducers( {
	requestStatus,
} );
