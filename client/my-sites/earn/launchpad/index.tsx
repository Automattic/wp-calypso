import { CircularProgressBar } from '@automattic/components';
import { useLaunchpad } from '@automattic/data-stores';
import { Launchpad, Task } from '@automattic/launchpad';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'calypso/state';
import { getSelectedSite } from 'calypso/state/ui/selectors';

const EarnLaunchpad = () => {
	const checklistSlug = 'earn-newsletter';
	const translate = useTranslate();

	const site = useSelector( ( state ) => getSelectedSite( state ) );

	const {
		data: { checklist },
	} = useLaunchpad( site?.slug ?? null, checklistSlug );

	const numberOfSteps = checklist?.length || 0;
	const completedSteps = ( checklist?.filter( ( task: Task ) => task.completed ) || [] ).length;

	return (
		<div className="earn__launchpad">
			<div className="earn__launchpad-header">
				<div className="earn__launchpad-progress-bar-container">
					<CircularProgressBar
						size={ 30 }
						enableDesktopScaling
						numberOfSteps={ numberOfSteps }
						currentStep={ completedSteps }
					/>
				</div>
				<h2 className="earn__launchpad-title">
					{ translate( 'Create your paid newsletter in two steps.' ) }
				</h2>
			</div>
			<Launchpad
				siteSlug={ site?.slug ?? null }
				checklistSlug={ checklistSlug }
				// taskFilter={ taskFilter }
			/>
		</div>
	);
};

export default EarnLaunchpad;
