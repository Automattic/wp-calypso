import { useLaunchpad } from '@automattic/data-stores';
import Checklist from './checklist';
import type { Task } from './types';

export interface LaunchpadProps {
	siteSlug: string | null;
	checklistSlug?: string | 0 | null | undefined;
	makeLastTaskPrimaryAction?: boolean;
	taskFilter?: ( tasks: Task[] ) => Task[];
}

const Launchpad = ( {
	siteSlug,
	checklistSlug,
	taskFilter,
	makeLastTaskPrimaryAction,
}: LaunchpadProps ) => {
	const launchpadData = useLaunchpad( siteSlug || '', checklistSlug );
	const { isFetchedAfterMount, data } = launchpadData;

	const originalTasks = data.checklist || [];
	const tasks = taskFilter ? taskFilter( originalTasks ) : originalTasks;

	return (
		<div className="launchpad__checklist-wrapper">
			{ isFetchedAfterMount ? (
				<Checklist tasks={ tasks } makeLastTaskPrimaryAction={ makeLastTaskPrimaryAction } />
			) : (
				<Checklist.Placeholder />
			) }
		</div>
	);
};

export default Launchpad;
