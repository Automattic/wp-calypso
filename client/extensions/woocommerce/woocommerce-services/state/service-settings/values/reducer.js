/**
 * External dependencies
 */
import objectPath from 'object-path-immutable';

/**
 * Internal dependencies
 */
import {
	UPDATE_FIELD,
	REMOVE_FIELD,
	ADD_ARRAY_FIELD_ITEM,
} from './actions';

const reducers = {};

reducers[ UPDATE_FIELD ] = ( state, action ) => {
	return objectPath.set( state, action.path, action.value );
};

reducers[ REMOVE_FIELD ] = ( state, action ) => {
	return objectPath.del( state, action.path, action.value );
};

reducers[ ADD_ARRAY_FIELD_ITEM ] = ( state, action ) => {
	return objectPath.push( state, action.path, action.item );
};

const settings = ( state = {}, action ) => {
	if ( 'function' === typeof reducers[ action.type ] ) {
		return reducers[ action.type ]( state, action );
	}
	return state;
};

export default settings;
