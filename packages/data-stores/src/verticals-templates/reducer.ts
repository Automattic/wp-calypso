import { combineReducers } from '@wordpress/data';
import type { Reducer } from 'redux';

import type { Action } from './actions';
import type { Template } from './types';

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
