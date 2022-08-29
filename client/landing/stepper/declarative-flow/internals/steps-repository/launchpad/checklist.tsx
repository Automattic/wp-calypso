import { SiteDetails } from 'calypso/../packages/data-stores/src';
import ChecklistItem from './checklist-item';
import { getArrayOfFilteredTasks, getEnhancedTasks } from './task-helper';
import { Task } from './types';

interface ChecklistProps {
	tasks: Task[];
	site: SiteDetails | null;
	siteSlug: string | null;
	flow: string | null;
}

const Checklist = ( { tasks, site, siteSlug, flow }: ChecklistProps ) => {
	const arrayOfFilteredTasks: Task[] | null = getArrayOfFilteredTasks( tasks, flow );

	const enhancedTasks =
		arrayOfFilteredTasks && getEnhancedTasks( arrayOfFilteredTasks, siteSlug, site );

	return (
		<ul className="launchpad__checklist" aria-label="Launchpad Checklist">
			{ enhancedTasks &&
				enhancedTasks.map( ( task: Task ) => (
					<ChecklistItem key={ task.id } task={ task } site={ site } />
				) ) }
		</ul>
	);
};

export default Checklist;
