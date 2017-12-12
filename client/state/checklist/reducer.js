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
import { SITE_CHECKLIST_RECEIVE, SITE_CHECKLIST_TASK_UPDATE } from 'state/action-types';
import { items as itemSchemas } from './schema';

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

export default combineReducers( {
	items,
} );
