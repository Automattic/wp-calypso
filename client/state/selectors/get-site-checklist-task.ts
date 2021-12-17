import { AppState } from 'calypso/types';
import getSiteChecklist from './get-site-checklist';
import type { Task } from 'calypso/state/checklist/types';

export default function getSiteChecklistTask(
	state: AppState,
	siteId: number,
	taskId: string
): Task | undefined {
	return getSiteChecklist( state, siteId )?.tasks.find( ( task ) => task.id === taskId );
}
