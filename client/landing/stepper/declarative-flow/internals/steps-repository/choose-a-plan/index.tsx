/* eslint-disable wpcalypso/jsx-classname-namespace */
import { StepContainer } from 'calypso/../packages/onboarding/src';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { Step } from '../../types';

import 'calypso/../packages/plans-grid/src/plans-grid/style.scss';
import 'calypso/../packages/plans-grid/src/plans-table/style.scss';
import './style.scss';

const ChooseAPlan: Step = function ChooseAPlan( { navigation } ) {
	const { goNext, goBack } = navigation;

	return (
		<StepContainer
			stepName="chooseAPlan"
			shouldHideNavButtons={ false }
			goBack={ goBack }
			goNext={ goNext }
			isHorizontalLayout={ false }
			isWideLayout={ true }
			isLargeSkipLayout={ false }
			stepContent={ <h1>Choose a plan step</h1> }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default ChooseAPlan;
