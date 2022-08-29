import { StepContainer } from 'calypso/../packages/onboarding/src';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { Step } from '../../types';

const PatternAssembler: Step = ( { navigation } ) => {
	const { goNext, goBack } = navigation;

	return (
		<StepContainer
			stepName={ 'pattern-assembler' }
			goBack={ goBack }
			goNext={ goNext }
			isHorizontalLayout={ false }
			isWideLayout={ true }
			hideSkip={ true }
			stepContent={ <></> }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default PatternAssembler;
