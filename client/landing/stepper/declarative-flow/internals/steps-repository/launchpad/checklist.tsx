import ChecklistItem from './checklist-item';
import { getArrayOfFilteredTasks, getEnhancedTasks } from './task-helper';
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
	const arrayOfFilteredTasks: Task[] | null = getArrayOfFilteredTasks( tasks, flow );

	const enhancedTasks = arrayOfFilteredTasks && getEnhancedTasks( arrayOfFilteredTasks, siteSlug );

	return (
		<ul className="launchpad__checklist" aria-label="Launchpad Checklist">
			{ enhancedTasks &&
				enhancedTasks.map( ( task: Task ) => <ChecklistItem key={ task.id } task={ task } /> ) }
		</ul>
	);
};

export default Checklist;
