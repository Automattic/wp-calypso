import { CircularProgressBar } from '@automattic/components';
import { useLaunchpad } from '@automattic/data-stores';
import { Launchpad, Task, setUpActionsForTasks } from '@automattic/launchpad';
import { useTranslate } from 'i18n-calypso';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSelector } from 'calypso/state';
import { getSelectedSite } from 'calypso/state/ui/selectors';

const EarnLaunchpad = () => {
	const translate = useTranslate();

	const site = useSelector( ( state ) => getSelectedSite( state ) );
	const isNewsletterOrWriteIntent =
		site?.options?.site_intent === 'newsletter' || site?.options?.site_intent === 'write';

	const {
		data: { checklist },
	} = useLaunchpad( site?.slug ?? null, getChecklistSlug() );

	const numberOfSteps = checklist?.length || 0;
	const completedSteps = ( checklist?.filter( ( task: Task ) => task.completed ) || [] ).length;
	const tasklistCompleted = completedSteps >= numberOfSteps;

	const tracksData = {
		recordTracksEvent,
		checklistSlug: getChecklistSlug(),
		tasklistCompleted,
		launchpadContext: 'earn',
	};

	function getChecklistSlug() {
		return isNewsletterOrWriteIntent ? 'earn-newsletter' : '';
	}

	function shouldLoadLaunchpad() {
		return isNewsletterOrWriteIntent && ! tasklistCompleted && numberOfSteps > 0;
	}

	const taskFilter = ( tasks: Task[] ) => {
		return setUpActionsForTasks( {
			tasks,
			siteSlug: site?.slug ?? null,
			tracksData,
		} );
	};

	if ( ! shouldLoadLaunchpad() ) {
		return null;
	}

	return (
		<div className="earn__launchpad">
			<div className="earn__launchpad-header">
				<h2 className="earn__launchpad-title">
					{ translate( 'Create your paid newsletter in two steps.' ) }
				</h2>
				<div className="earn__launchpad-progress-bar-container">
					<CircularProgressBar
						size={ 30 }
						enableDesktopScaling
						numberOfSteps={ numberOfSteps }
						currentStep={ completedSteps }
					/>
				</div>
			</div>
			<Launchpad
				siteSlug={ site?.slug ?? null }
				checklistSlug={ getChecklistSlug() }
				taskFilter={ taskFilter }
			/>
		</div>
	);
};

export default EarnLaunchpad;
