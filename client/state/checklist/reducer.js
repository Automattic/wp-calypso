/**
 * Internal dependencies
 */
import { combineReducers, createReducer } from 'state/utils';
import {
	JETPACK_MODULE_ACTIVATE_SUCCESS,
	SITE_CHECKLIST_RECEIVE,
	SITE_CHECKLIST_TASK_UPDATE,
	SITE_CHECKLIST_REQUEST,
} from 'state/action-types';
import { items as itemSchemas } from './schema';

export const isLoading = createReducer( false, {
	[ SITE_CHECKLIST_REQUEST ]: () => true,
	[ SITE_CHECKLIST_RECEIVE ]: () => false,
} );

function markChecklistTaskComplete( state, { siteId, taskId } ) {
	const siteState = state[ siteId ] || {};
	const tasks = { ...siteState.tasks, [ taskId ]: true };
	return {
		...state,
		[ siteId ]: { ...siteState, tasks },
	};
}

export const items = createReducer(
	{},
	{
		[ SITE_CHECKLIST_RECEIVE ]: ( state, { siteId, checklist } ) => ( {
			...state,
			[ siteId ]: checklist,
		} ),
		[ SITE_CHECKLIST_TASK_UPDATE ]: ( state, { siteId, taskId } ) => {
			return markChecklistTaskComplete( state, { siteId, taskId } );
		},
		[ JETPACK_MODULE_ACTIVATE_SUCCESS ]: ( state, { moduleSlug, siteId } ) => {
			if ( moduleSlug === 'monitor' ) {
				return markChecklistTaskComplete( state, { siteId, taskId: 'jetpack_monitor' } );
			}
			return state;
		},
	},
	itemSchemas
);

export default combineReducers( {
	items,
	isLoading,
} );
