/** @format */
/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import getSiteChecklist from 'state/selectors/get-site-checklist';

/**
 * Returns the checklist for the specified site ID
 *
 * @param  {Object}  state  Global state tree
 * @param  {number}  siteId Site ID
 * @param  {string}  taskId Task ID
 * @return {Object}         Site settings
 */
export default function getChecklistTask( state, siteId, taskId ) {
	return get( getSiteChecklist( state, siteId ), [ 'tasks', taskId, 'completed' ], null );
}
