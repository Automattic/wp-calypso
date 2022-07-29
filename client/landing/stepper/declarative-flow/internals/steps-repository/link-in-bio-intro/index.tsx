import { StepContainer } from 'calypso/../packages/onboarding/src';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import Intro from './intro';
import type { Step } from '../../types';

import './styles.scss';

const LinkInBioIntro: Step = function LinkInBioIntro( { navigation } ) {
	const { goNext, goBack } = navigation;

	const handleGetStarted = () => {
		//neeeds to be implemented
		goNext();
	};
	return (
		<StepContainer
			stepName={ 'linkInBioIntro' }
			goBack={ goBack }
			goNext={ goNext }
			isHorizontalLayout={ false }
			isWideLayout={ true }
			isLargeSkipLayout={ false }
			stepContent={ <Intro goNext={ handleGetStarted } /> }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default LinkInBioIntro;
