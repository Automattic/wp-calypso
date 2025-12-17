import { combineReducers } from '@wordpress/data';
import type { AgentsManagerAction } from './actions';
import type { Location } from 'history';
import type { Reducer } from 'redux';

const isOpen: Reducer< boolean | undefined, AgentsManagerAction > = ( state, action ) => {
	switch ( action.type ) {
		case 'AGENTS_MANAGER_SET_OPEN':
			return action.isOpen;
	}
	return state;
};

const isDocked: Reducer< boolean | undefined, AgentsManagerAction > = ( state, action ) => {
	switch ( action.type ) {
		case 'AGENTS_MANAGER_SET_DOCKED':
			return action.isDocked;
	}
	return state;
};

const routerHistory: Reducer<
	{ entries: Location[]; index: number } | undefined,
	AgentsManagerAction
> = ( state, action ) => {
	switch ( action.type ) {
		case 'AGENTS_MANAGER_SET_ROUTER_HISTORY':
			return action.history;
	}
	return state;
};

const isLoading: Reducer< boolean, AgentsManagerAction > = ( state = false, action ) => {
	switch ( action.type ) {
		case 'AGENTS_MANAGER_SET_LOADING':
			return action.isLoading;
	}
	return state;
};

const hasLoaded: Reducer< boolean, AgentsManagerAction > = ( state = false, action ) => {
	switch ( action.type ) {
		case 'AGENTS_MANAGER_SET_HAS_LOADED':
			return action.hasLoaded;
	}
	return state;
};

const floatingPosition: Reducer< 'left' | 'right', AgentsManagerAction > = (
	state = 'right',
	action
) => {
	switch ( action.type ) {
		case 'AGENTS_MANAGER_SET_FLOATING_POSITION':
			return action.floatingPosition;
	}
	return state;
};

const reducer = combineReducers( {
	isOpen,
	isDocked,
	routerHistory,
	isLoading,
	hasLoaded,
	floatingPosition,
} );

export type State = ReturnType< typeof reducer >;

export default reducer;
