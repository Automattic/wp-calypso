/**
 * Internal dependencies
 */
import { combineReducers, withSchemaValidation } from 'state/utils';
import {
	ALL_DOMAINS_REQUEST,
	ALL_DOMAINS_REQUEST_FAILURE,
	ALL_DOMAINS_REQUEST_SUCCESS,
} from 'state/action-types';

import { allDomainsSchema } from './schema';

export const allDomains = withSchemaValidation( allDomainsSchema, ( state = [], action ) => {
	switch ( action.type ) {
		case ALL_DOMAINS_REQUEST_SUCCESS:
			return action.domains;
	}

	return state;
} );

export const errors = ( state = null, action ) => {
	switch ( action.type ) {
		case ALL_DOMAINS_REQUEST:
		case ALL_DOMAINS_REQUEST_SUCCESS:
			return null;

		case ALL_DOMAINS_REQUEST_FAILURE:
			return action.error;
	}

	return state;
};

export const requesting = ( state = false, action ) => {
	switch ( action.type ) {
		case ALL_DOMAINS_REQUEST:
		case ALL_DOMAINS_REQUEST_FAILURE:
		case ALL_DOMAINS_REQUEST_SUCCESS:
			return action.type === ALL_DOMAINS_REQUEST;
	}

	return state;
};

export default combineReducers( {
	domains: allDomains,
	requesting,
	errors,
} );
