import { StepContainer } from '@automattic/onboarding';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import TrialPlan from './trial-plan';
import type { Step } from 'calypso/landing/stepper/declarative-flow/internals/types';
import './style.scss';

const MigrationTrial: Step = function MigrationTrial( { navigation } ) {
	const { goBack } = navigation;

	return (
		<StepContainer
			stepName="migration-trial"
			className="import-layout__center"
			hideSkip={ true }
			hideBack={ false }
			hideFormattedHeader={ true }
			goBack={ goBack }
			isWideLayout={ false }
			stepContent={ <TrialPlan /> }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default MigrationTrial;
