/** @format */

/**
 * Internal dependencies
 */
import {
	SITE_CHECKLIST_RECEIVE,
	SITE_CHECKLIST_REQUEST,
	SITE_CHECKLIST_TASK_UPDATE,
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
