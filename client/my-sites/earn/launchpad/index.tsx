import { CircularProgressBar } from '@automattic/components';
import { Launchpad, type Task } from '@automattic/launchpad';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'calypso/state';
import { getSelectedSite } from 'calypso/state/ui/selectors';

type EarnLaunchpadProps = {
	launchpad: {
		checklistSlug: string;
		taskFilter: ( tasks: Task[] ) => Task[];
		numberOfSteps: number;
		completedSteps: number;
		shouldLoad: boolean;
	};
};

const EarnLaunchpad = ( { launchpad }: EarnLaunchpadProps ) => {
	const { checklistSlug, taskFilter, numberOfSteps, completedSteps } = launchpad;
	const translate = useTranslate();
	const site = useSelector( getSelectedSite );
	const isNewsletter = 'newsletter' === site?.options?.site_intent;

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
					{ isNewsletter
						? translate( 'Create your paid newsletter in two steps.' )
						: translate( 'Create your paid offering in two steps.' ) }
				</h2>
				<p className="earn__launchpad-description">
					{ translate( 'Let your fans support your art, writing, or project directly.' ) }
				</p>
			</div>
			<Launchpad
				siteSlug={ site?.slug ?? null }
				checklistSlug={ checklistSlug }
				onPostFilterTasks={ taskFilter }
				launchpadContext="earn"
			/>
		</div>
	);
};

export default EarnLaunchpad;
