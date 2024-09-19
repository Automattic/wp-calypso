import { Card, CircularProgressBar } from '@automattic/components';
import { Checklist, ChecklistItem } from '@automattic/launchpad';
import { useTranslate } from 'i18n-calypso';
import useOnboardingTours from 'calypso/a8c-for-agencies/hooks/use-onboarding-tours';

import './style.scss';

export default function OverviewBodyNextSteps() {
	const translate = useTranslate();

	const tasks = useOnboardingTours();

	const numberOfTasks = tasks.length;
	const completedTasks = tasks.filter( ( task ) => task.completed ).length;

	const isCompleted = completedTasks === numberOfTasks;

	return (
		<Card>
			<div className="next-steps">
				<div className="next-steps__header">
					<h2>{ isCompleted ? translate( '🎉 Congratulations!' ) : translate( 'Next Steps' ) }</h2>
					<CircularProgressBar
						size={ 32 }
						enableDesktopScaling
						numberOfSteps={ numberOfTasks }
						currentStep={ completedTasks }
					/>
				</div>
				{ isCompleted && (
					<p>
						{ translate(
							"Right now there's nothing left for you to do. We'll let you know when anything needs your attention."
						) }
					</p>
				) }
				<Checklist>
					{ tasks.map( ( task ) => (
						<ChecklistItem task={ task } key={ task.id } />
					) ) }
				</Checklist>
			</div>
		</Card>
	);
}
