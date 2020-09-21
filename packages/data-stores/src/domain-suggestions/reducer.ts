/**
 * External dependencies
 */
import type { Reducer } from 'redux';
import { combineReducers } from '@wordpress/data';
import type { TimestampMS } from 'wp-calypso-client/types';

/**
 * Internal dependencies
 */
import type { DomainSuggestion, DomainCategory, DomainAvailability } from './types';
import type { Action } from './actions';
import { DataStatus } from './constants';
import { stringifyDomainQueryObject } from './utils';

export interface DomainSuggestionState {
	state: DataStatus;
	data: Record< string, DomainSuggestion[] | undefined >;
	errorMessage: string | null;
	lastUpdated: TimestampMS;
	pendingSince: TimestampMS | undefined;
}

const initialDomainSuggestionState: DomainSuggestionState = {
	state: DataStatus.Uninitialized,
	data: {},
	errorMessage: null,
	lastUpdated: -Infinity,
	pendingSince: undefined,
};

const domainSuggestions: Reducer< DomainSuggestionState, Action > = (
	state = initialDomainSuggestionState,
	action
) => {
	if ( action.type === 'FETCH_DOMAIN_SUGGESTIONS' ) {
		return {
			...state,
			state: DataStatus.Pending,
			errorMessage: null,
			pendingSince: action.timeStamp,
		};
	}

	if ( action.type === 'RECEIVE_DOMAIN_SUGGESTIONS_DATA' ) {
		return {
			...state,
			state: DataStatus.Success,
			data: {
				...state.data,
				[ stringifyDomainQueryObject( action.queryObject ) ]: action.suggestions,
			},
			errorMessage: null,
			lastUpdated: action.timeStamp,
			pendingSince: undefined,
		};
	}

	if ( action.type === 'RECEIVE_DOMAIN_SUGGESTIONS_ERROR' ) {
		return {
			...state,
			state: DataStatus.Failure,
			errorMessage: action.errorMessage,
			lastUpdated: action.timeStamp,
			pendingSince: undefined,
		};
	}

	return state;
};

const categories: Reducer< DomainCategory[], Action > = ( state = [], action ) => {
	if ( action.type === 'RECEIVE_CATEGORIES' ) {
		return action.categories;
	}
	return state;
};

const availability: Reducer< Record< string, DomainAvailability | undefined >, Action > = (
	state = {},
	action
) => {
	if ( action.type === 'RECEIVE_DOMAIN_AVAILABILITY' ) {
		return {
			...state,
			[ action.domainName ]: action.availability,
		};
	}
	return state;
};

const reducer = combineReducers( { categories, domainSuggestions, availability } );

export type State = ReturnType< typeof reducer >;

export default reducer;
