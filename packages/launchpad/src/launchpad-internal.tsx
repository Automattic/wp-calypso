import { useLaunchpad } from '@automattic/data-stores';
import { useRef, useMemo } from 'react';
import Checklist from './checklist';
import type { Task } from './types';
import type { UseLaunchpadOptions } from '@automattic/data-stores';

export interface LaunchpadInternalProps {
	siteSlug: string | null;
	checklistSlug?: string | 0 | null | undefined;
	makeLastTaskPrimaryAction?: boolean;
	taskFilter?: ( tasks: Task[] ) => Task[];
	useLaunchpadOptions?: UseLaunchpadOptions;
}

/**
 * Low-level launchpad component that should only be used in exceptional cases.
 * Please use the main Launchpad component whenever possible.
 */
const LaunchpadInternal = ( {
	siteSlug,
	checklistSlug,
	taskFilter,
	makeLastTaskPrimaryAction,
	useLaunchpadOptions = {},
}: LaunchpadInternalProps ) => {
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
					tasks={ tasks.current }
					makeLastTaskPrimaryAction={ makeLastTaskPrimaryAction }
				/>
			) : (
				<Checklist.Placeholder />
			) }
		</div>
	);
};

export default LaunchpadInternal;
