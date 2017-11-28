/** @format */

/**
 * Internal dependencies
 */

import { SITE_CHECKLIST_REQUEST } from 'state/action-types';

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
