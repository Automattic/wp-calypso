import { combineReducers } from '@wordpress/data';
import { PerSiteLastActivity, PerSiteRouterHistory } from './types';
import type { AgentsManagerAction } from './actions';
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

export const isMinimized: Reducer< boolean | undefined, AgentsManagerAction > = (
	state,
	action
) => {
	switch ( action.type ) {
		case 'AGENTS_MANAGER_SET_MINIMIZED':
			return action.isMinimized;
	}
	return state;
};

const routerHistory: Reducer< PerSiteRouterHistory | undefined, AgentsManagerAction > = (
	state,
	action
) => {
	switch ( action.type ) {
		case 'AGENTS_MANAGER_SET_ROUTER_HISTORY':
			return action.history;
	}
	return state;
};

const lastActivity: Reducer< PerSiteLastActivity | undefined, AgentsManagerAction > = (
	state,
	action
) => {
	switch ( action.type ) {
		case 'AGENTS_MANAGER_SET_LAST_ACTIVITY':
			return action.lastActivity;
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

export const isSplitScreen: Reducer< boolean, AgentsManagerAction > = ( state = false, action ) => {
	switch ( action.type ) {
		case 'AGENTS_MANAGER_SET_SPLIT_SCREEN':
			return action.isSplitScreen;
		// Split-screen only makes sense while docked. Reset on undock so an
		// out-of-band `setIsDocked(false)` (e.g. from `window.__agentsManagerActions`)
		// can't leave a stale `true` that re-applies on the next dock.
		case 'AGENTS_MANAGER_SET_DOCKED':
			return action.isDocked ? state : false;
	}
	return state;
};

const reducer = combineReducers( {
	isOpen,
	isDocked,
	isMinimized,
	routerHistory,
	lastActivity,
	isLoading,
	hasLoaded,
	floatingPosition,
	isSplitScreen,
} );

export type State = ReturnType< typeof reducer >;

export default reducer;
