import {
	StepContainer,
	isNewHostedSiteCreationFlow,
	isEntrepreneurSignupFlow,
} from '@automattic/onboarding';
import { useSaveHostingFlowPathStep } from 'calypso/landing/stepper/hooks/use-save-hosting-flow-path-step';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { EntrepreneurTrialAcknowledge } from './entrepreneur-trial-acknowledge';
import { HostingTrialAcknowledge } from './hosting-trial-acknowledge';
import { MigrationTrialAcknowledge } from './migration-trial-acknowledge';
import type { Step } from 'calypso/landing/stepper/declarative-flow/internals/types';
import './style.scss';

const TrialAcknowledge: Step = function TrialAcknowledge( { navigation, flow, stepName } ) {
	const { goBack } = navigation;

	useSaveHostingFlowPathStep( flow, `/setup/${ flow }/${ stepName }` );

	const getStepContent = () => {
		if ( isEntrepreneurSignupFlow( flow ) ) {
			return (
				<EntrepreneurTrialAcknowledge
					flow={ flow }
					navigation={ navigation }
					stepName={ stepName }
				/>
			);
		}

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
			hideSkip
			hideBack={ false }
			hideFormattedHeader
			goBack={ goBack }
			isWideLayout={ false }
			stepContent={ getStepContent() }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default TrialAcknowledge;
