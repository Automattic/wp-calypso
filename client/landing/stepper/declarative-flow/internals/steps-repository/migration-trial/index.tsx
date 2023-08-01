import { StepContainer } from '@automattic/onboarding';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import TrialPlan from './trial-plan';
import type { Step } from 'calypso/landing/stepper/declarative-flow/internals/types';
import './style.scss';

const MigrationTrial: Step = function MigrationTrial( { navigation } ) {
	const site = useSite();
	const { goBack } = navigation;

	if ( ! site ) {
		return null;
	}

	return (
		<StepContainer
			stepName="migration-trial"
			className="import-layout__center"
			hideSkip={ true }
			hideBack={ false }
			hideFormattedHeader={ true }
			goBack={ goBack }
			isWideLayout={ false }
			stepContent={ <TrialPlan site={ site } /> }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default MigrationTrial;
