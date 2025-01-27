import { Card, CircularProgressBar } from '@automattic/components';
import { Checklist, ChecklistItem } from '@automattic/launchpad';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import useOnboardingTours from 'calypso/a8c-for-agencies/hooks/use-onboarding-tours';

import './style.scss';

export default function OverviewBodyNextSteps() {
	const translate = useTranslate();

	const { tasks, completedTasks, isCompleted, isDismissed, dismiss } = useOnboardingTours();

	if ( isDismissed ) {
		return null;
	}

	return (
		<Card>
			<div className="next-steps">
				<div className="next-steps__header">
					<h2>{ isCompleted ? translate( '🎉 Congratulations!' ) : translate( 'Next Steps' ) }</h2>

					{ isCompleted ? (
						<Button variant="tertiary" onClick={ dismiss }>
							{ translate( 'Dismiss' ) }
						</Button>
					) : (
						<CircularProgressBar
							size={ 32 }
							enableDesktopScaling
							numberOfSteps={ tasks.length }
							currentStep={ completedTasks.length }
						/>
					) }
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
