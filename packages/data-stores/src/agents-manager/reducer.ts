import { combineReducers } from '@wordpress/data';
import type { AgentsManagerAction } from './actions';
import type { Location } from '../shared-types';
import type { Reducer } from 'redux';

const isOpen: Reducer< boolean | undefined, AgentsManagerAction > = ( state, action ) => {
	switch ( action.type ) {
		case 'AGENTS_MANAGER_SET_OPEN':
			return action.open;
	}
	return state;
};

const isDocked: Reducer< boolean, AgentsManagerAction > = ( state = false, action ) => {
	switch ( action.type ) {
		case 'AGENTS_MANAGER_SET_DOCKED':
			return action.docked;
	}
	return state;
};

const agentsManagerRouterHistory: Reducer<
	{ entries: Location[]; index: number } | undefined,
	AgentsManagerAction
> = ( state, action ) => {
	switch ( action.type ) {
		case 'AGENTS_MANAGER_SET_ROUTER_HISTORY':
			return action.history;
	}
	return state;
};

const reducer = combineReducers( {
	isOpen,
	isDocked,
	agentsManagerRouterHistory,
} );

export type State = ReturnType< typeof reducer >;

export default reducer;
