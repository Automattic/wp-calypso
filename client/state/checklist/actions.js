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
 * @param {string} siteId for the checklist
 * @param {object} checklist the new checklist state
 * @returns {object} action object
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
 * @param {string} siteId for the checklist
 * @returns {object} action object
 */
export const requestSiteChecklist = siteId => ( {
	type: SITE_CHECKLIST_REQUEST,
	siteId,
	meta: {
		dataLayer: {
			trackRequest: true,
		},
	},
} );

/**
 * Action creator function: SITE_CHECKLIST_TASK_UPDATE
 *
 * @param {string} siteId for the checklist
 * @param {string} taskId for the task
 * @returns {object} action object
 */
export const requestSiteChecklistTaskUpdate = ( siteId, taskId ) => ( {
	type: SITE_CHECKLIST_TASK_UPDATE,
	siteId,
	taskId,
} );
