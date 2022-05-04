import { combineReducers } from '@wordpress/data';
import type { HelpCenterAction } from './actions';
import type { Reducer } from 'redux';

const showHelpCenter: Reducer< boolean | undefined, HelpCenterAction > = ( state, action ) => {
	switch ( action.type ) {
		case 'HELP_CENTER_SET_SHOW':
			return action.show;
	}
	return state;
};

const reducer = combineReducers( {
	showHelpCenter,
} );

export type State = ReturnType< typeof reducer >;

export default reducer;
