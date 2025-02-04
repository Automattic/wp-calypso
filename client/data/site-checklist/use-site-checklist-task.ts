import { Task } from 'calypso/state/checklist/types';
import { CHECKLIST_KNOWN_TASKS } from 'calypso/state/data-layer/wpcom/checklist/index.js';
import useSiteChecklist from './use-site-checklist';

/**
 * Request a update for the specified task
 * @param siteId The site ID
 * @param taskId The task ID you want to update
 */
const useSiteChecklistTask = (
	siteId: string,
	taskId: ( typeof CHECKLIST_KNOWN_TASKS )[ keyof typeof CHECKLIST_KNOWN_TASKS ]
): Task | undefined => {
	const siteChecklist = useSiteChecklist( siteId );
	return siteChecklist?.tasks?.find( ( { id } ) => id === taskId );
};

export default useSiteChecklistTask;
