import ChecklistItem from './checklist-item';
import { getEnhancedTasks } from './task-helper';
import { launchpadFlowTasks } from './tasks';
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
	const currentFlowTasksIds = flow ? launchpadFlowTasks[ flow ] : null;

	const arrayOfFilteredTasks: Task[] | null =
		currentFlowTasksIds &&
		currentFlowTasksIds.reduce( ( accumulator, currentTaskId ) => {
			tasks.find( ( task ) => {
				if ( task.id === currentTaskId ) {
					accumulator.push( task );
				}
			} );
			return accumulator;
		}, [] as Task[] );

	const enhancedTasks = arrayOfFilteredTasks && getEnhancedTasks( arrayOfFilteredTasks, siteSlug );

	return (
		<ul className="launchpad__checklist" aria-label="Launchpad Checklist">
			{ enhancedTasks &&
				enhancedTasks.map( ( task: Task ) => <ChecklistItem key={ task.id } task={ task } /> ) }
		</ul>
	);
};

export default Checklist;
