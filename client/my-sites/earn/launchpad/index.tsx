import { CircularProgressBar } from '@automattic/components';
import { useLaunchpad, LaunchpadNavigator } from '@automattic/data-stores';
import { Launchpad, Task, setUpActionsForTasks } from '@automattic/launchpad';
import { useDispatch } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSelector } from 'calypso/state';
import { getSelectedSite } from 'calypso/state/ui/selectors';

const EarnLaunchpad = () => {
	const translate = useTranslate();

	const site = useSelector( ( state ) => getSelectedSite( state ) );

	const {
		data: { checklist },
	} = useLaunchpad( site?.slug ?? null, 'earn' );

	const { setActiveChecklist } = useDispatch( LaunchpadNavigator.store );

	const numberOfSteps = checklist?.length || 0;
	const completedSteps = ( checklist?.filter( ( task: Task ) => task.completed ) || [] ).length;
	const tasklistCompleted = completedSteps >= numberOfSteps;

	const tracksData = {
		recordTracksEvent,
		checklistSlug: 'earn',
		tasklistCompleted,
		launchpadContext: 'earn',
	};

	function shouldLoadLaunchpad() {
		return numberOfSteps > 0;
	}

	const taskFilter = ( tasks: Task[] ) => {
		return setUpActionsForTasks( {
			tasks,
			siteSlug: site?.slug ?? null,
			tracksData,
			extraActions: { setActiveChecklist },
		} );
	};

	if ( ! shouldLoadLaunchpad() ) {
		return null;
	}

	return (
		<div className="earn__launchpad">
			<div className="earn__launchpad-header">
				<div className="earn__launchpad-progress-bar-container">
					<CircularProgressBar
						size={ 40 }
						enableDesktopScaling
						numberOfSteps={ numberOfSteps }
						currentStep={ completedSteps }
					/>
				</div>
				<h2 className="earn__launchpad-title">
					{ translate( 'Create your paid offering in two steps.' ) }
				</h2>
				<p className="earn__launchpad-description">
					{ translate( 'Let your fans support your art, writing, or project directly.' ) }
				</p>
			</div>
			<Launchpad siteSlug={ site?.slug ?? null } checklistSlug="earn" taskFilter={ taskFilter } />
		</div>
	);
};

export default EarnLaunchpad;
