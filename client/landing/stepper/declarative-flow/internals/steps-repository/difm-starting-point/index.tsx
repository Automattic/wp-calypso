import { StepContainer } from '@automattic/onboarding';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import DIFMLanding from 'calypso/my-sites/marketing/do-it-for-me/difm-landing';
import type { Step } from '../../types';

import './style.scss';
const STEP_NAME = 'difmStartingPoint';
const DIFMStartingPoint: Step = function ( { navigation, flow } ) {
	const { goNext, goBack, submit } = navigation;

	const onSubmit = () => {
		submit?.();
	};

	const onSkip = () => {
		recordTracksEvent( 'calypso_signup_skip_step', {
			flow,
			step: STEP_NAME,
		} );

		goNext?.();
	};

	return (
		<StepContainer
			stepName={ STEP_NAME }
			goBack={ goBack }
			goNext={ goNext }
			isHorizontalLayout={ true }
			isWideLayout={ true }
			isLargeSkipLayout={ false }
			stepContent={
				<DIFMLanding onSubmit={ onSubmit } onSkip={ onSkip } isInOnboarding={ true } />
			}
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default DIFMStartingPoint;
