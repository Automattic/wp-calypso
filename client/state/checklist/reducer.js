/**
 * External dependencies
 *
 * @format
 */

import { assign } from 'lodash';

/**
 * Internal dependencies
 */
import { combineReducers, createReducer } from 'state/utils';
import {
	SITE_CHECKLIST_RECEIVE,
	SITE_CHECKLIST_TASK_UPDATE,
	SITE_CHECKLIST_NOTIFICATION,
} from 'state/action-types';
import { items as itemSchemas, checklistNotificationSchema } from './schema';

export const items = createReducer(
	{},
	{
		[ SITE_CHECKLIST_RECEIVE ]: ( state, { siteId, checklist } ) => ( {
			...state,
			[ siteId ]: checklist,
		} ),
		[ SITE_CHECKLIST_TASK_UPDATE ]: ( state, { siteId, taskId } ) => {
			const siteState = state[ siteId ];
			const tasks = assign( {}, siteState.tasks, { [ taskId ]: true } );
			return {
				...state,
				[ siteId ]: assign( {}, siteState, { tasks } ),
			};
		},
	},
	itemSchemas
);

export const showChecklistNotification = createReducer(
	false,
	{
		[ SITE_CHECKLIST_NOTIFICATION ]: ( state, action ) => action.bool,
	},
	checklistNotificationSchema
);

export default combineReducers( {
	items,
	showChecklistNotification,
} );
