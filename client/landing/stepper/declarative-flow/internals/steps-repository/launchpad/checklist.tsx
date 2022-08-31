import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import ChecklistItem from './checklist-item';
import { getArrayOfFilteredTasks, getEnhancedTasks } from './task-helper';
import { Task } from './types';

interface ChecklistProps {
	tasks: Task[];
	siteSlug: string | null;
	flow: string | null;
}

const Checklist = ( { tasks, siteSlug, flow }: ChecklistProps ) => {
	const site = useSite();
	const arrayOfFilteredTasks: Task[] | null = getArrayOfFilteredTasks( tasks, flow );
	const enhancedTasks =
		arrayOfFilteredTasks && site && getEnhancedTasks( arrayOfFilteredTasks, siteSlug, site );

	return (
		<ul className="launchpad__checklist" aria-label="Launchpad Checklist">
			{ enhancedTasks &&
				enhancedTasks.map( ( task: Task ) => <ChecklistItem key={ task.id } task={ task } /> ) }
		</ul>
	);
};

export default Checklist;
