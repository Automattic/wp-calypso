import { combineReducers } from 'redux';
import assign from 'lodash/assign';
import omit from 'lodash/omit';
import omitBy from 'lodash/omitBy';

import {
	READER_SITE_REQUEST,
	READER_SITE_REQUEST_SUCCESS,
	READER_SITE_REQUEST_FAILURE,
	DESERIALIZE,
	SERIALIZE
} from 'state/action-types';

import { isValidStateWithSchema } from 'state/utils';
import { readerSitesSchema } from './schema';

const actionMap = {
	[ SERIALIZE ]: handleSerialize,
	[ DESERIALIZE ]: handleDeserialize,
	[ READER_SITE_REQUEST_SUCCESS ]: handleRequestSuccess,
	[ READER_SITE_REQUEST_FAILURE ]: handleRequestFailure
};

function defaultHandler( state ) {
	return state;
}

function handleSerialize( state ) {
	// remove errors from the serialized state
	return omitBy( state, 'is_error' );
}

function handleDeserialize( state ) {
	if ( isValidStateWithSchema( state, readerSitesSchema ) ) {
		return state;
	}
	return {};
}

function handleRequestFailure( state, action ) {
	// new object proceeds current state to prevent new errors from overwriting existing values
	return assign( {
		[ action.payload.ID ]: {
			ID: action.payload.ID,
			is_error: true
		}
	}, state );
}

function handleRequestSuccess( state, action ) {
	const site = assign( {}, action.payload );
	// TODO do we need to normalize site entries somehow?
	return assign( {}, state, {
		[ action.payload.ID ]: site
	} );
}

export function items( state = {}, action ) {
	const handler = actionMap[ action.type ] || defaultHandler;
	return handler( state, action );
}

export function queuedRequests( state = {}, action ) {
	switch ( action.type ) {
		case READER_SITE_REQUEST:
			return assign( {}, state, {
				[ action.payload.ID ]: true
			} );
			break;
		case READER_SITE_REQUEST_SUCCESS:
		case READER_SITE_REQUEST_FAILURE:
			return omit( state, action.payload.ID );
			break;
	}
	return state;
}

export default combineReducers( {
	items,
	queuedRequests
} );
