import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Card } from '@automattic/components';
import { LaunchpadNavigator, useLaunchpad } from '@automattic/data-stores';
import { Launchpad, type Task, setUpActionsForTasks } from '@automattic/launchpad';
import { useDispatch } from '@wordpress/data';

import './style.scss';

export type FloatingNavigatorProps = {
	siteSlug: string | null;
};

const FloatingNavigator = ( { siteSlug }: FloatingNavigatorProps ) => {
	const launchpadContext = 'navigator';
	const checklistSlug = 'intent-build';

	const {
		data: { checklist },
	} = useLaunchpad( siteSlug, checklistSlug );

	const tasklistCompleted = checklist?.every( ( task: Task ) => task.completed ) || false;

	const tracksData = { recordTracksEvent, checklistSlug, tasklistCompleted, launchpadContext };

	const { setActiveChecklist } = useDispatch( LaunchpadNavigator.store );

	const taskFilter = ( tasks: Task[] ) => {
		return setUpActionsForTasks( {
			tasks,
			siteSlug,
			tracksData,
			extraActions: {
				setActiveChecklist,
			},
		} );
	};
	return (
		<Card className="launchpad-navigator__floating-navigator">
			<Launchpad siteSlug={ siteSlug } checklistSlug={ checklistSlug } taskFilter={ taskFilter } />
		</Card>
	);
};

export default FloatingNavigator;
