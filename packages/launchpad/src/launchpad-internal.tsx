import { useLaunchpad } from '@automattic/data-stores';
import { useMemo } from 'react';
import Checklist, { Placeholder as ChecklistPlaceHolder } from './checklist';
import ChecklistItem from './checklist-item';
import { useTracking } from './use-tracking';
import type { Task } from './types';
import type { SiteDetails, UseLaunchpadOptions } from '@automattic/data-stores';

export interface LaunchpadInternalProps {
	site?: SiteDetails | null;
	flow?: string;
	siteSlug: string | null;
	checklistSlug: string | null;
	makeLastTaskPrimaryAction?: boolean;
	taskFilter?: ( tasks: Task[] ) => Task[];
	useLaunchpadOptions?: UseLaunchpadOptions;
	launchpadContext: string;
	// Temporary flag to disable the auto tracking of click events
	disableAutoTrackClickEvents?: boolean;
}

/**
 * Low-level launchpad component that should only be used in exceptional cases.
 * Please use the main Launchpad component whenever possible.
 */
const LaunchpadInternal = ( {
	flow,
	site,
	siteSlug,
	checklistSlug,
	taskFilter,
	makeLastTaskPrimaryAction,
	useLaunchpadOptions = {},
	launchpadContext,
	disableAutoTrackClickEvents = true,
}: LaunchpadInternalProps ) => {
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

	const { trackClick } = useTracking( {
		tasks,
		checklistSlug,
		siteIntent: site?.options?.site_intent,
		flow,
		context: launchpadContext,
	} );

	const itemClickHandler = ( task: Task ) => {
		if ( ! disableAutoTrackClickEvents ) {
			trackClick( task );
		}
		task?.actionDispatch?.();
	};

	const items = tasks.map( ( task ) => (
		<ChecklistItem task={ task } key={ task.id } onClick={ () => itemClickHandler( task ) } />
	) );

	return (
		<div className="launchpad__checklist-wrapper">
			{ isFetchedAfterMount ? (
				<Checklist items={ items } makeLastTaskPrimaryAction={ makeLastTaskPrimaryAction } />
			) : (
				<ChecklistPlaceHolder />
			) }
		</div>
	);
};

export default LaunchpadInternal;
