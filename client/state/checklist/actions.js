/** @format */

/**
 * Internal dependencies
 */
import {
	SITE_CHECKLIST_RECEIVE,
	SITE_CHECKLIST_REQUEST,
	SITE_CHECKLIST_TASK_UPDATE,
	SITE_CHECKLIST_NOTIFICATION,
} from 'state/action-types';

import 'state/data-layer/wpcom/checklist';

/**
 * Action creator function: SITE_CHECKLIST_RECEIVE
 *
 * @param {String} siteId for the checklist
 * @param {Object} checklist the new checklist state
 * @return {Object} action object
 */
export function receiveSiteChecklist( siteId, checklist ) {
	return {
		type: SITE_CHECKLIST_RECEIVE,
		siteId,
		checklist,
	};
}

/**
 * Action creator function: SITE_CHECKLIST_REQUEST
 *
 * @param {String} siteId for the checklist
 * @return {Object} action object
 */
export const requestSiteChecklist = siteId => ( {
	type: SITE_CHECKLIST_REQUEST,
	siteId,
} );

/**
 * Action creator function: SITE_CHECKLIST_TASK_UPDATE
 *
 * @param {String} siteId for the checklist
 * @param {String} taskId for the task
 * @return {Object} action object
 */
export const requestSiteChecklistTaskUpdate = ( siteId, taskId ) => ( {
	type: SITE_CHECKLIST_TASK_UPDATE,
	siteId,
	taskId,
} );

/**
 * Returns true if site checklist notification is currently showing.
 *
 * @param {Object} state Global state tree
 * @return {bool} True if currently showing checklist notification
 */
export function getChecklistStatus( state ) {
	return state.checklist.showChecklistNotification;
}

/**
 * Action creator function: SITE_CHECKLIST_NOTIFICATION
 *
 * @param {Boolean} bool checklist notification
 * @return {Object} action object
 */
export function setChecklistStatus( bool ) {
	return {
		type: SITE_CHECKLIST_NOTIFICATION,
		bool,
	};
}
