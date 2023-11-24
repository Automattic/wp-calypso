import { CircularProgressBar } from '@automattic/components';
import { useLaunchpadNavigator, useSortedLaunchpadTasks } from '@automattic/data-stores';
import type { Task } from '@automattic/launchpad';

import './style.scss';

type LaunchpadNavigatorIconProps = {
	siteId: number;
};

const LaunchpadNavigatorIcon = ( { siteId }: LaunchpadNavigatorIconProps ) => {
	const {
		data: { current_checklist: currentNavigatorChecklist },
	} = useLaunchpadNavigator( siteId, null );

	const {
		data: { checklist },
	} = useSortedLaunchpadTasks( siteId, currentNavigatorChecklist );

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
