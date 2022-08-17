/* eslint-disable wpcalypso/jsx-classname-namespace */
import { StepContainer } from 'calypso/../packages/onboarding/src';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { Step } from '../../types';

const ChooseADesign: Step = function ChooseADesign( { navigation } ) {
	const { goNext, goBack } = navigation;

	return (
		<StepContainer
			stepName={ 'chooseADesign' }
			goBack={ goBack }
			goNext={ goNext }
			isHorizontalLayout={ false }
			isWideLayout={ true }
			isLargeSkipLayout={ false }
			stepContent={ <h1>Choose a design temporary step</h1> }
			recordTracksEvent={ recordTracksEvent }
			hideBack={ true }
		/>
	);
};

export default ChooseADesign;
