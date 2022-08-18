import { translate } from 'i18n-calypso';
import ChecklistItem from './checklist-item';
import { getEnhancedTasks } from './task-helper';
import { launchpad_flow_tasks } from './tasks';
import { Task } from './types';

const Checklist = ( {
	tasks,
	siteSlug,
	flow,
}: {
	tasks: Task[];
	siteSlug: string | null;
	flow: string | null;
} ) => {
	const currentFlowTasksIds = flow ? launchpad_flow_tasks[ flow ] : null;

	const arrayOfFilteredTasks =
		currentFlowTasksIds &&
		currentFlowTasksIds.map( ( taskId: string ) => {
			return tasks.find( ( task ) => {
				return task.id === taskId;
			} );
		} );

	const enhancedTasks = getEnhancedTasks( arrayOfFilteredTasks, siteSlug, translate );

	return (
		<ul className="launchpad__checklist" aria-label="Launchpad Checklist">
			{ enhancedTasks.map( ( task: any ) => (
				<ChecklistItem key={ task.id } task={ task } />
			) ) }
		</ul>
	);
};

export default Checklist;
