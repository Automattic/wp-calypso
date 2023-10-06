import { useLaunchpad } from '@automattic/data-stores';
import { useRef, useMemo } from 'react';
import Checklist from './checklist';
import type { Task } from './types';
import type { UseLaunchpadOptions } from '@automattic/data-stores';

export interface LaunchpadProps {
	siteSlug: string | null;
	checklistSlug?: string | 0 | null | undefined;
	makeLastTaskPrimaryAction?: boolean;
	taskFilter?: ( tasks: Task[] ) => Task[];
	useLaunchpadOptions?: UseLaunchpadOptions;
	context: string;
}

const Launchpad = ( {
	siteSlug,
	checklistSlug,
	taskFilter,
	makeLastTaskPrimaryAction,
	useLaunchpadOptions = {},
	context,
}: LaunchpadProps ) => {
	const launchpadData = useLaunchpad( siteSlug || '', checklistSlug, useLaunchpadOptions );
	const { isFetchedAfterMount, data } = launchpadData;
	const tasks = useRef< Task[] >( [] );

	useMemo( () => {
		const originalTasks = data.checklist || [];
		tasks.current = taskFilter ? taskFilter( originalTasks ) : originalTasks;
	}, [ data, taskFilter ] );

	return (
		<div className="launchpad__checklist-wrapper">
			{ isFetchedAfterMount ? (
				<Checklist
					context={ context }
					tasks={ tasks.current }
					makeLastTaskPrimaryAction={ makeLastTaskPrimaryAction }
				/>
			) : (
				<Checklist.Placeholder />
			) }
		</div>
	);
};

export default Launchpad;
