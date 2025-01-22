import { useLaunchpad } from '@automattic/data-stores';
import { type FC, useMemo } from 'react';
import Checklist, { Placeholder as ChecklistPlaceHolder } from './checklist';
import ChecklistItem from './checklist-item';
import { useTracking } from './use-tracking';
import type { Task } from './types';
import type { SiteDetails, UseLaunchpadOptions } from '@automattic/data-stores';

interface Props {
	site?: SiteDetails | null;
	siteSlug: string | null;
	checklistSlug: string | null;
	makeLastTaskPrimaryAction?: boolean;
	highlightNextAction?: boolean;
	taskFilter?: ( tasks: Task[] ) => Task[];
	useLaunchpadOptions?: UseLaunchpadOptions;
	launchpadContext: string;
	flow?: string;
}

/**
 * Low-level launchpad component that should only be used in exceptional cases.
 * Please use the main Launchpad component whenever possible.
 */
const LaunchpadInternal: FC< Props > = ( {
	flow,
	site,
	siteSlug,
	checklistSlug,
	taskFilter,
	makeLastTaskPrimaryAction,
	highlightNextAction,
	useLaunchpadOptions = {},
	launchpadContext,
} ) => {
	const launchpadData = useLaunchpad(
		siteSlug || '',
		checklistSlug,
		useLaunchpadOptions,
		launchpadContext
	);

	const { isFetchedAfterMount, data } = launchpadData;
	const { checklist } = data;

	const tasks = useMemo( () => {
		if ( ! checklist ) {
			return [];
		}
		return taskFilter ? taskFilter( checklist ) : checklist;
		// Array of tasks requires deep comparison
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ JSON.stringify( checklist ), taskFilter ] );

	const { trackTaskClick } = useTracking( {
		tasks,
		checklistSlug,
		site,
		context: launchpadContext,
		flow,
	} );

	const itemClickHandler = ( task: Task ) => {
		trackTaskClick( task );
		task?.actionDispatch?.();
	};

	return (
		<div className="launchpad__checklist-wrapper">
			{ isFetchedAfterMount ? (
				<Checklist
					makeLastTaskPrimaryAction={ makeLastTaskPrimaryAction }
					highlightNextAction={ highlightNextAction }
				>
					{ tasks.map( ( task ) => (
						<ChecklistItem
							task={ task }
							key={ task.id }
							onClick={ () => itemClickHandler( task ) }
						/>
					) ) }
				</Checklist>
			) : (
				<ChecklistPlaceHolder />
			) }
		</div>
	);
};

export default LaunchpadInternal;
