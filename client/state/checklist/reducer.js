/**
 * Internal dependencies
 */
import { combineReducers, keyedReducer } from 'state/utils';
import {
	JETPACK_MODULE_ACTIVATE_SUCCESS,
	JETPACK_MODULE_DEACTIVATE_SUCCESS,
	SITE_CHECKLIST_RECEIVE,
	SITE_CHECKLIST_TASK_UPDATE,
} from 'state/action-types';
import { items as itemSchemas } from './schema';

const markChecklistTaskComplete = ( state, taskId ) => ( {
	...state,
	tasks: { ...state.tasks, [ taskId ]: { completed: true } },
} );

const moduleTaskMap = {
	lazy_images: 'jetpack_lazy_images',
	monitor: 'jetpack_monitor',
	// Both photon and photon-cdn mark the Site Accelerator Task as completed
	photon: 'jetpack_site_accelerator',
	'photon-cdn': 'jetpack_site_accelerator',
	search: 'jetpack_search',
	videopress: 'jetpack_video_hosting',
};

function items( state = {}, action ) {
	switch ( action.type ) {
		case SITE_CHECKLIST_RECEIVE:
			return action.checklist;
		case SITE_CHECKLIST_TASK_UPDATE:
			return markChecklistTaskComplete( state, action.taskId );
		case JETPACK_MODULE_ACTIVATE_SUCCESS:
			if ( moduleTaskMap.hasOwnProperty( action.moduleSlug ) ) {
				return markChecklistTaskComplete( state, moduleTaskMap[ action.moduleSlug ] );
			}
			break;
		case JETPACK_MODULE_DEACTIVATE_SUCCESS:
			if ( action.moduleSlug === 'photon' || action.moduleSlug === 'photon-cdn' ) {
				// We can't know if the other module is still active, so we don't change
				// Site Accelerator task completion state.
				return;
			}

			if ( moduleTaskMap.hasOwnProperty( action.moduleSlug ) ) {
				return toggleChecklistTask( state, moduleTaskMap[ action.moduleSlug ] );
			}
			break;
	}
	return state;
}
items.schema = itemSchemas;

const reducer = combineReducers( {
	items,
} );

export default keyedReducer( 'siteId', reducer );
