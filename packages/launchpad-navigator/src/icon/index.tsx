import { CircularProgressBar } from '@automattic/components';
import { useLaunchpadNavigator, useSortedLaunchpadTasks } from '@automattic/data-stores';
import type { Task } from '@automattic/launchpad';

import './style.scss';

type LaunchpadNavigatorIconProps = {
	siteSlug: string | null;
};

const LaunchpadNavigatorIcon = ( { siteSlug }: LaunchpadNavigatorIconProps ) => {
	const {
		data: { current_checklist: currentNavigatorChecklist },
	} = useLaunchpadNavigator( siteSlug, null );

	const {
		data: { checklist },
	} = useSortedLaunchpadTasks( siteSlug, currentNavigatorChecklist );

	const numberOfSteps = checklist?.length || 0;
	const completedSteps = ( checklist?.filter( ( task: Task ) => task.completed ) || [] ).length;
	return (
		<CircularProgressBar
			size={ 15 }
			strokeWidth={ 2 }
			enableDesktopScaling
			numberOfSteps={ numberOfSteps }
			currentStep={ completedSteps }
			showProgressText={ false }
		/>
	);
};

export default LaunchpadNavigatorIcon;
