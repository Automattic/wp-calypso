/**
 * External dependencies
 */
import { Reducer } from 'redux';
import { combineReducers } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { ActionType, Template } from './types';
import { Action } from './actions';

const templates: Reducer< Record< string, Template[] | undefined >, Action > = (
	state = {},
	action
) => {
	if ( action.type === ActionType.RECEIVE_TEMPLATES ) {
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
