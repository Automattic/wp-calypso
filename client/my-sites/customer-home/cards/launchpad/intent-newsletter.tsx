import { useLaunchpad } from '@automattic/data-stores';
import { setUpActionsForTasks } from '@automattic/launchpad';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSelector } from 'calypso/state';
import isSiteAtomic from 'calypso/state/selectors/is-site-wpcom-atomic';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import CustomerHomeLaunchpad from '.';
import type { Task } from '@automattic/launchpad';
import type { AppState } from 'calypso/types';

const LaunchpadIntentNewsletter = ( { checklistSlug }: { checklistSlug: string } ): JSX.Element => {
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( ( state: AppState ) => getSiteSlug( state, siteId ) );
	const launchpadContext = 'customer-home';
	const isAtomicSite = useSelector( ( state: AppState ) => {
		return ( siteId && isSiteAtomic( state, siteId ) ) as boolean;
	} );

	const {
		data: { checklist },
	} = useLaunchpad( siteSlug, checklistSlug );

	const numberOfSteps = checklist?.length || 0;
	const completedSteps = ( checklist?.filter( ( task: Task ) => task.completed ) || [] ).length;
	const tasklistCompleted = numberOfSteps > 0 && completedSteps === numberOfSteps;
	const tracksData = { recordTracksEvent, checklistSlug, tasklistCompleted, launchpadContext };

	const sortedTasksWithActions = ( tasks: Task[] ) => {
		return setUpActionsForTasks( { tasks, siteSlug, tracksData, isAtomicSite } );
	};

	return (
		<CustomerHomeLaunchpad
			checklistSlug={ checklistSlug }
			taskFilter={ sortedTasksWithActions }
		></CustomerHomeLaunchpad>
	);
};

export const LaunchpadIntentFreeNewsletter = (): JSX.Element => {
	return <LaunchpadIntentNewsletter checklistSlug="intent-free-newsletter" />;
};

export const LaunchpadIntentPaidNewsletter = (): JSX.Element => {
	return <LaunchpadIntentNewsletter checklistSlug="intent-paid-newsletter" />;
};
