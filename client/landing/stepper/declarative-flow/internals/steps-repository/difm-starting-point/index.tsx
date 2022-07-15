import { StepContainer } from '@automattic/onboarding';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import DIFMLanding from 'calypso/my-sites/marketing/do-it-for-me/difm-landing';
import type { Step } from '../../types';

import './style.scss';

const DIFMStartingPoint: Step = function ( { navigation } ) {
	const { goNext, goBack, submit } = navigation;

	const onSubmit = () => {
		submit?.();
	};

	const onSkip = () => {
		goNext?.();
	};

	return (
		<StepContainer
			stepName={ 'difmStartingPoint' }
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
