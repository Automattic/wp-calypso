/** @format */

/**
 * Internal dependencies
 */

import {
	MY_SITES_SIDEBAR_SITE_TOGGLE,
	MY_SITES_SIDEBAR_DESIGN_TOGGLE,
	MY_SITES_SIDEBAR_TOOLS_TOGGLE,
	MY_SITES_SIDEBAR_MANAGE_TOGGLE,
} from 'state/action-types';

import { combineReducers } from 'state/utils';

export function isSiteOpen( state = false, action ) {
	switch ( action.type ) {
		case MY_SITES_SIDEBAR_SITE_TOGGLE:
			return ! state;
	}

	return state;
}

export function isDesignOpen( state = false, action ) {
	switch ( action.type ) {
		case MY_SITES_SIDEBAR_DESIGN_TOGGLE:
			return ! state;
	}

	return state;
}

export function isToolsOpen( state = false, action ) {
	switch ( action.type ) {
		case MY_SITES_SIDEBAR_TOOLS_TOGGLE:
			return ! state;
	}

	return state;
}

export function isManageOpen( state = false, action ) {
	switch ( action.type ) {
		case MY_SITES_SIDEBAR_MANAGE_TOGGLE:
			return ! state;
	}

	return state;
}

export default combineReducers( {
	isSiteOpen,
	isDesignOpen,
	isToolsOpen,
	isManageOpen,
} );
