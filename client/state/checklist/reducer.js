/**
 * Internal dependencies
 */
import {
	combineReducers,
	keyedReducer,
	withSchemaValidation,
	withStorageKey,
} from 'calypso/state/utils';
import {
	JETPACK_MODULE_ACTIVATE_SUCCESS,
	JETPACK_MODULE_DEACTIVATE_SUCCESS,
	SITE_CHECKLIST_RECEIVE,
	SITE_CHECKLIST_TASK_UPDATE,
} from 'calypso/state/action-types';
import { items as itemSchemas } from './schema';
import { CHECKLIST_KNOWN_TASKS } from 'calypso/state/data-layer/wpcom/checklist/index.js';

const setChecklistTaskCompletion = ( state, taskId, completed ) => ( {
	...state,
	tasks: state.tasks?.map( ( task ) =>
		task.id === taskId ? { ...task, isCompleted: completed } : task
	),
} );

const moduleTaskMap = {
	'lazy-images': CHECKLIST_KNOWN_TASKS.JETPACK_LAZY_IMAGES,
	monitor: CHECKLIST_KNOWN_TASKS.JETPACK_MONITOR,
	// Both photon and photon-cdn mark the Site Accelerator Task as completed
	photon: CHECKLIST_KNOWN_TASKS.JETPACK_SITE_ACCELERATOR,
	'photon-cdn': CHECKLIST_KNOWN_TASKS.JETPACK_SITE_ACCELERATOR,
	search: CHECKLIST_KNOWN_TASKS.JETPACK_SEARCH,
	videopress: CHECKLIST_KNOWN_TASKS.JETPACK_VIDEO_HOSTING,
};

const items = withSchemaValidation( itemSchemas, ( state = {}, action ) => {
	switch ( action.type ) {
		case SITE_CHECKLIST_RECEIVE:
			return action.checklist;
		case SITE_CHECKLIST_TASK_UPDATE:
			return setChecklistTaskCompletion( state, action.taskId, true );
		case JETPACK_MODULE_ACTIVATE_SUCCESS:
			if ( moduleTaskMap.hasOwnProperty( action.moduleSlug ) ) {
				return setChecklistTaskCompletion( state, moduleTaskMap[ action.moduleSlug ], true );
			}
			break;
		case JETPACK_MODULE_DEACTIVATE_SUCCESS:
			if ( action.moduleSlug === 'photon' || action.moduleSlug === 'photon-cdn' ) {
				// We can't know if the other module is still active, so we don't change
				// Site Accelerator task completion state.
				return state;
			}

			if ( moduleTaskMap.hasOwnProperty( action.moduleSlug ) ) {
				return setChecklistTaskCompletion( state, moduleTaskMap[ action.moduleSlug ], false );
			}
			break;
	}
	return state;
} );

const reducer = combineReducers( {
	items,
} );

const checklistReducer = keyedReducer( 'siteId', reducer );

export default withStorageKey( 'checklist', checklistReducer );
