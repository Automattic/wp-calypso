import { combineReducers } from '@wordpress/data';
import type { Action } from './actions';
import type { Template } from './types';
import type { Reducer } from 'redux';

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
