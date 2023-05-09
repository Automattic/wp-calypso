import { CHECKLIST_KNOWN_TASKS } from 'calypso/state/data-layer/wpcom/checklist/index.js';
import getSiteChecklist from 'calypso/state/selectors/get-site-checklist';
import getSiteTaskList from 'calypso/state/selectors/get-site-task-list';
import isSiteChecklistLoading from 'calypso/state/selectors/is-site-checklist-loading';
import { getSiteFrontPage } from 'calypso/state/sites/selectors';

/**
 * Checks whether the tasklist has been completed.
 *
 * @param  {Object}  state  Global state tree
 * @param  {number}  siteId Site ID
 * @returns {string} null if there's no data yet, false if the tasklist is incomplete, true if it's complete.
 */
export default function isSiteChecklistComplete( state, siteId ) {
	const siteChecklist = getSiteChecklist( state, siteId );

	if (
		isSiteChecklistLoading( state, siteId ) ||
		null === siteChecklist ||
		! Array.isArray( siteChecklist.tasks )
	) {
		return null;
	}

	// True if a static page has been set as the front page, false otherwise.
	const hasFrontPageSet = !! getSiteFrontPage( state, siteId );

	/**
	 *	If a task is completed, it's because:
	 *	A) the task is marked as complete, its isCompleted prop is true.
	 *	B) the task front_page_updated is pending but the site doesn't have a page set as front page.
	 *	This is because updating the front page doesn't apply when the site doesn't have a page set as the front page.
	 *	Any other case leads to a pending task.
	 *	C) the mobile_app_installed task, because it shouldn't affect the site setup status.
	 *	D) the site_menu_updated task, because it shouldn't affect the site setup status.
	 *
	 *		@param   {Object}  task The task that we'll check to see if it's completed.
	 *		@returns {boolean}      Whether the task is considered to be completed or not.
	 */
	const isTaskComplete = ( task ) => {
		if ( task.isCompleted ) {
			return true;
		}

		if ( CHECKLIST_KNOWN_TASKS.FRONT_PAGE_UPDATED === task.id && ! hasFrontPageSet ) {
			return true;
		}

		// The mobile app setup task shouldn't affect the site setup status.
		if ( CHECKLIST_KNOWN_TASKS.MOBILE_APP_INSTALLED === task.id ) {
			return true;
		}

		// The menu updating task isn't mandatory because not every site needs menu changes
		// to be made. However the task also isn't skippable (#47334), so if a user chooses
		// to leave the task undone it shouldn't count towards not completing setup.
		if ( CHECKLIST_KNOWN_TASKS.SITE_MENU_UPDATED === task.id ) {
			return true;
		}

		return false;
	};

	const taskList = getSiteTaskList( state, siteId );
	return taskList.getAll().every( isTaskComplete );
}
