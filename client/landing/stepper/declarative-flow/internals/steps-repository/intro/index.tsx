import cx from 'classnames';
import { StepContainer } from 'calypso/../packages/onboarding/src';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import IntroStep from './intro';
import type { Step } from '../../types';

import './styles.scss';

const Intro: Step = function Intro( { navigation, flow } ) {
	const { submit, goBack } = navigation;
	const isVideoPressFlow = 'videopress' === flow;

	const handleSubmit = () => {
		submit?.();
	};
	return (
		<StepContainer
			flowName={ flow as string }
			stepName={ 'intro' }
			className={ cx( { 'is-newsletter': flow === 'newsletter' } ) }
			goBack={ goBack }
			isHorizontalLayout={ false }
			isWideLayout={ true }
			isLargeSkipLayout={ false }
			stepContent={ <IntroStep flowName={ flow as string } onSubmit={ handleSubmit } /> }
			recordTracksEvent={ recordTracksEvent }
			showJetpackPowered={ ! isVideoPressFlow }
			showVideoPressPowered={ isVideoPressFlow }
		/>
	);
};

export default Intro;
