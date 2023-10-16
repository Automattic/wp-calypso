import { CircularProgressBar } from '@automattic/components';
import { DefaultWiredLaunchpad } from '@automattic/launchpad';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'calypso/state';
import { getSelectedSite } from 'calypso/state/ui/selectors';

type EarnLaunchpadProps = {
	numberOfSteps: number;
	completedSteps: number;
};

const EarnLaunchpad = ( { numberOfSteps, completedSteps }: EarnLaunchpadProps ) => {
	const translate = useTranslate();

	const site = useSelector( ( state ) => getSelectedSite( state ) );

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
			<DefaultWiredLaunchpad
				siteSlug={ site?.slug ?? null }
				checklistSlug="earn"
				launchpadContext="earn"
			/>
		</div>
	);
};

export default EarnLaunchpad;
