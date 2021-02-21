/**
 * Internal dependencies
 */
import {
	SITE_CHECKLIST_RECEIVE,
	SITE_CHECKLIST_REQUEST,
	SITE_CHECKLIST_TASK_UPDATE,
} from 'calypso/state/action-types';

import 'calypso/state/data-layer/wpcom/checklist';
import 'calypso/state/checklist/init';

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
 * @param {boolean} isSiteEligibleForFSE whether or not the site is eligible for Full Site Editing
 * @returns {object} action object
 */
export const requestSiteChecklist = ( siteId, isSiteEligibleForFSE = false ) => ( {
	type: SITE_CHECKLIST_REQUEST,
	siteId,
	isSiteEligibleForFSE,
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
