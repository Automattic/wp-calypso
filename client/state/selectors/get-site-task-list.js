/** @format */
/**
 * External dependencies
 */
import { get } from 'lodash';
/**
 * Internal dependencies
 */
import { getTaskList } from 'my-sites/checklist/wpcom-checklist/wpcom-task-list';
import getSiteChecklist from './get-site-checklist';
import getChecklistTaskUrls from './get-checklist-task-urls';

/**
 * Returns the checklist for the specified site ID
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @return {Object}        Site settings
 */
export default function getSiteTaskList( state, siteId ) {
	const siteChecklist = getSiteChecklist( state, siteId );
	const taskList = getTaskList( {
		taskStatuses: get( siteChecklist, 'tasks' ),
		phase2: get( siteChecklist, 'phase2' ),
		siteVerticals: get( siteChecklist, 'verticals' ),
		siteSegment: get( siteChecklist, 'siteSegment' ),
	} );
	const taskUrls = getChecklistTaskUrls( state, siteId );
	taskList.removeTasksWithoutUrls( taskUrls );
	return taskList;
}
