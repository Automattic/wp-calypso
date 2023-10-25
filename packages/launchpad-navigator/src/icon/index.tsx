import { CircularProgressBar } from '@automattic/components';
import {
	LaunchpadNavigator,
	sortLaunchpadTasksByCompletionStatus,
	useLaunchpad,
} from '@automattic/data-stores';
import { select } from '@wordpress/data';
import type { Task } from '@automattic/launchpad';

import './style.scss';

type LaunchpadNavigatorIconProps = {
	siteSlug: string | null;
};

const LaunchpadNavigatorIcon = ( { siteSlug }: LaunchpadNavigatorIconProps ) => {
	const currentNavigatorChecklistSlug =
		select( LaunchpadNavigator.store ).getActiveChecklistSlug() || null;

	const launchpadOptions = {
		onSuccess: sortLaunchpadTasksByCompletionStatus,
	};

	const {
		data: { checklist },
	} = useLaunchpad( siteSlug, currentNavigatorChecklistSlug, launchpadOptions );

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
