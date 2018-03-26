/**
 * External dependencies
 */
import objectPath from 'object-path-immutable';

/**
 * Internal dependencies
 */
import { WOOCOMMERCE_SERVICES_SERVICE_SETTINGS_UPDATE_FIELD } from '../action-types';

const reducers = {};

reducers[ WOOCOMMERCE_SERVICES_SERVICE_SETTINGS_UPDATE_FIELD ] = ( state, action ) => {
	return objectPath.set( state, action.path, action.value );
};

const settings = ( state = {}, action ) => {
	if ( 'function' === typeof reducers[ action.type ] ) {
		return reducers[ action.type ]( state, action );
	}
	return state;
};

export default settings;
