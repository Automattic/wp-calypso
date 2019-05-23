/**
 * Internal dependencies
 */
import { combineReducers, createReducer, keyedReducer } from 'state/utils';
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

const markChecklistTaskComplete = ( state, { taskId } ) => ( {
	...state,
	tasks: { ...state.tasks, [ taskId ]: true },
} );

export const items = createReducer(
	{},
	{
		[ SITE_CHECKLIST_RECEIVE ]: ( state, { checklist } ) => checklist,
		[ SITE_CHECKLIST_TASK_UPDATE ]: ( state, { taskId } ) =>
			markChecklistTaskComplete( state, { taskId } ),
		[ JETPACK_MODULE_ACTIVATE_SUCCESS ]: ( state, { moduleSlug } ) => {
			if ( moduleSlug === 'monitor' ) {
				return markChecklistTaskComplete( state, { taskId: 'jetpack_monitor' } );
			}
			return state;
		},
	},
	itemSchemas
);

const reducer = combineReducers( {
	items,
	isLoading,
} );

export default keyedReducer( 'siteId', reducer );
