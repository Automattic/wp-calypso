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

export const items = createReducer(
	{},
	{
		[ SITE_CHECKLIST_RECEIVE ]: ( state, { siteId, checklist } ) => ( {
			...state,
			[ siteId ]: checklist,
		} ),
		[ SITE_CHECKLIST_TASK_UPDATE ]: ( state, { siteId, taskId } ) => {
			const siteState = state[ siteId ];
			const tasks = { ...siteState.tasks, [ taskId ]: true };
			return {
				...state,
				[ siteId ]: { ...siteState, tasks },
			};
		},
		[ JETPACK_MODULE_ACTIVATE_SUCCESS ]: ( state, { moduleSlug, siteId } ) => {
			if ( moduleSlug === 'monitor' ) {
				const siteState = state[ siteId ];
				const tasks = { ...siteState.tasks, jetpack_monitor: true };
				return {
					...state,
					[ siteId ]: { ...siteState, tasks },
				};
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
