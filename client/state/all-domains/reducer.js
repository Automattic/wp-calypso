import { withStorageKey } from '@automattic/state-utils';
import {
	ALL_DOMAINS_NAVIGATION_SET,
	ALL_DOMAINS_REQUEST,
	ALL_DOMAINS_REQUEST_FAILURE,
	ALL_DOMAINS_REQUEST_SUCCESS,
} from 'calypso/state/action-types';
import { createLightSiteDomainObject } from 'calypso/state/all-domains/helpers';
import { combineReducers, withSchemaValidation } from 'calypso/state/utils';
import { allDomainsSchema, navigationSchema } from './schema';

export const allDomains = withSchemaValidation( allDomainsSchema, ( state = [], action ) => {
	switch ( action.type ) {
		case ALL_DOMAINS_REQUEST_SUCCESS:
			return ( action?.domains ?? [] ).map( createLightSiteDomainObject );
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

export const navigation = withSchemaValidation(
	navigationSchema,
	( state = { currentPage: 1 }, action ) => {
		switch ( action.type ) {
			case ALL_DOMAINS_NAVIGATION_SET:
				return { currentPage: action.currentPage };
		}

		return state;
	}
);

export default withStorageKey(
	'all-domains',
	combineReducers( {
		domains: allDomains,
		requesting,
		errors,
		navigation,
	} )
);
