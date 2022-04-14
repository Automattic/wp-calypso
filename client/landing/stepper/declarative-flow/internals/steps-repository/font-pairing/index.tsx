/* eslint-disable wpcalypso/jsx-classname-namespace */
import { StepContainer } from '@automattic/onboarding';
import StylePreview from 'calypso/landing/gutenboarding/onboarding-block/style-preview';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { Step } from '../../types';
import './style.scss';

const FontPairingStep: Step = function FontPairingStep( { navigation } ) {
	const { goBack, submit } = navigation;

	return (
		<StepContainer
			stepName={ 'font-pairing-step' }
			goBack={ goBack }
			hideSkip
			isFullLayout
			stepContent={ <StylePreview submit={ submit } /> }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default FontPairingStep;
