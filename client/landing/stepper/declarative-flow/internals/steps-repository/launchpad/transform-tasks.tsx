import { translate } from 'i18n-calypso';
import { Task } from 'calypso/state/checklist/types';
import { CHECKLIST_KNOWN_TASKS } from 'calypso/state/data-layer/wpcom/checklist/index.js';
import { LaunchpadTask } from './types';

/*
 * Delete this comment prior to merge.
 *
 * NOTE 1: This transform logic mimics similar logic for
 * Home Site Checklist items in the get_task() function
 * in the following file. We could add our logic there
 * instead of a separate method here. Depending on the
 * specific tasks in each launchpad flow, we may want
 * to re-use some of the default task transforms there.
 *
 * Reference:
 * calypso/my-sites/customer-home/cards/site-setup-list/get_task.js
 *
 * NOTE 2: Tasks must also be added and configured for API retreival
 * in the following two files on WordPress.com.
 *
 * Reference:
 * wp-content/lib/onboarding-checklist/blog-tasks.php
 * wp-content/lib/onboarding-checklist/retrieval.php
 *
 * NOTE 3: For the code here to work correctly, a site's
 * site_intent option must be set to the appropriate
 * launcpad flow (ie, "newsletter", "link-in-bio", etc).
 * The logic to set that is not in place as of this
 * initial PR.
 *
 * NOTE 4: For the code here to work correctly, you
 * will need to checkout the accompanying branch of
 * WordPress.com in your sandbox. That branch configures
 * the launchpad steps per Note 2 above).
 */
export const transformTasks = ( tasks: Task[] ): LaunchpadTask[] => {
	return tasks.flatMap( ( task ) => {
		switch ( task.id ) {
			case CHECKLIST_KNOWN_TASKS.NEWSLETTER_SETUP:
				return {
					...task,
					title: translate( 'Setup Newsletter' ),
					actionUrl: '',
				};
				break;
			case CHECKLIST_KNOWN_TASKS.LINKINBIO_SETUP:
				return {
					...task,
					title: translate( 'Setup Newsletter' ),
					actionUrl: '',
				};
				break;
			case CHECKLIST_KNOWN_TASKS.PODCAST_SETUP:
				return {
					...task,
					title: translate( 'Setup Newsletter' ),
					actionUrl: '',
				};
				break;
			case CHECKLIST_KNOWN_TASKS.PLAN_SELECTED:
				return {
					...task,
					title: translate( 'Setup Newsletter' ),
					actionUrl: '',
				};
				break;
			case CHECKLIST_KNOWN_TASKS.SUBSCRIBERS_ADDED:
				return {
					...task,
					title: translate( 'Add Subscribers' ),
					actionUrl: '',
				};
				break;
			case CHECKLIST_KNOWN_TASKS.LINKS_ADDED:
				return {
					...task,
					title: translate( 'Add Subscribers' ),
					actionUrl: '',
				};
				break;
			case CHECKLIST_KNOWN_TASKS.FIRST_POST_PUBLISHED:
				return {
					...task,
					title: translate( 'Publish First Post' ),
					actionUrl: '',
				};
				break;
			default:
				return [];
		}
	} );
};
