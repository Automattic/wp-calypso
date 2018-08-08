/** @format */
/**
 * Internal dependencies
 */
import { combineReducers, keyedReducer } from 'state/utils';
import { SITE_CHECKLIST_RECEIVE, SITE_CHECKLIST_TASK_UPDATE } from 'state/action-types';
import { items as itemSchemas } from './schema';

const taskUpdate = keyedReducer( 'taskId', () => true );

const items = keyedReducer( 'siteId', ( state = {}, action ) => {
	switch ( action.type ) {
		case SITE_CHECKLIST_RECEIVE:
			return action.checklist;

		case SITE_CHECKLIST_TASK_UPDATE:
			return taskUpdate( state, action );
	}
	return state;
} );
items.schema = itemSchemas;

export default combineReducers( {
	items,
} );
