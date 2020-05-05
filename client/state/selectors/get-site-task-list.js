/**
 * External dependencies
 */
import { get } from 'lodash';
/**
 * Internal dependencies
 */
import { getTaskList } from 'lib/checklist';
import getSiteChecklist from './get-site-checklist';
import getChecklistTaskUrls from './get-checklist-task-urls';

/**
 * Returns the checklist for the specified site ID
 *
 * @param  {object}  state  Global state tree
 * @param  {number}  siteId Site ID
 * @returns {object}        Site settings
 */
export default function getSiteTaskList( state, siteId ) {
	const siteChecklist = getSiteChecklist( state, siteId );
	const taskList = getTaskList( {
		taskStatuses: get( siteChecklist, 'tasks' ),
		siteVerticals: get( siteChecklist, 'verticals' ),
		siteSegment: get( siteChecklist, 'siteSegment' ),
	} );
	const taskUrls = getChecklistTaskUrls( state, siteId );
	taskList.removeTasksWithoutUrls( taskUrls );
	return taskList;
}
