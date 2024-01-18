import { StepContainer, isNewHostedSiteCreationFlow } from '@automattic/onboarding';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { HostingTrialAcknowledge } from './hosting-trial-acknowledge';
import { MigrationTrialAcknowledge } from './migration-trial-acknowledge';
import type { Step } from 'calypso/landing/stepper/declarative-flow/internals/types';
import './style.scss';

const TrialAcknowledge: Step = function TrialAcknowledge( { navigation, flow, stepName } ) {
	const { goBack } = navigation;

	const getStepContent = () => {
		if ( isNewHostedSiteCreationFlow( flow ) ) {
			return (
				<HostingTrialAcknowledge flow={ flow } navigation={ navigation } stepName={ stepName } />
			);
		}

		return (
			<MigrationTrialAcknowledge flow={ flow } stepName={ stepName } navigation={ navigation } />
		);
	};

	return (
		<StepContainer
			stepName="migration-trial"
			className="import-layout__center"
			hideSkip={ true }
			hideBack={ false }
			hideFormattedHeader={ true }
			goBack={ goBack }
			isWideLayout={ false }
			stepContent={ getStepContent() }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default TrialAcknowledge;
