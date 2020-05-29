/**
 * External dependencies
 */
import type { Reducer } from 'redux';
import { combineReducers } from '@wordpress/data';

/**
 * Internal dependencies
 */
import type { Template } from './types';
import type { Action } from './actions';

const templates: Reducer< Record< string, Template[] | undefined >, Action > = (
	state = {},
	action
) => {
	if ( action.type === 'RECEIVE_TEMPLATES' ) {
		return {
			...state,
			[ action.verticalId ]: action.templates,
		};
	}
	return state;
};

const reducer = combineReducers( { templates } );

export type State = ReturnType< typeof reducer >;

export default reducer;
