import cx from 'classnames';
import { StepContainer } from 'calypso/../packages/onboarding/src';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import Intro from './intro';
import type { Step } from '../../types';

import './styles.scss';

const intro: Step = function intro( { navigation, flow } ) {
	const { goNext, goBack } = navigation;

	const handleGetStarted = () => {
		// needs to be implemented
		goNext();
	};
	return (
		<StepContainer
			stepName={ cx( 'intro', { 'is-newsletters': flow === 'newsletters' } ) }
			goBack={ goBack }
			goNext={ goNext }
			isHorizontalLayout={ false }
			isWideLayout={ true }
			isLargeSkipLayout={ false }
			stepContent={ <Intro flowName={ flow } goNext={ handleGetStarted } /> }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default intro;
