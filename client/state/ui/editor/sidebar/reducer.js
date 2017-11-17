/** @format */
/**
 * Internal dependencies
 */
import { combineReducers } from 'state/utils';
import { EDITOR_NESTED_SIDEBAR_SET } from 'state/action-types';
import { NESTED_SIDEBAR_NONE } from './constants';

export function nestedSidebarTarget( state = NESTED_SIDEBAR_NONE, action ) {
	return action.type === EDITOR_NESTED_SIDEBAR_SET ? action.target : state;
}

export default combineReducers( {
	nestedSidebarTarget,
} );
