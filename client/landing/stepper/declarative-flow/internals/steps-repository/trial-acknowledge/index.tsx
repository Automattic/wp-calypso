import { StepContainer, isAnyMigrationFlow } from '@automattic/onboarding';
import { useSelect } from '@wordpress/data';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { HostingTrialAcknowledge } from './hosting-trial-acknowledge';
import { MigrationTrialAcknowledge } from './migration-trial-acknowledge';
import type { OnboardSelect } from '@automattic/data-stores';
import type { Step } from 'calypso/landing/stepper/declarative-flow/internals/types';
import './style.scss';

const TrialAcknowledge: Step = function TrialAcknowledge( { navigation, flow, stepName } ) {
	const { goBack } = navigation;
	const intent = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getIntent(),
		[]
	);

	const getStepContent = () => {
		if ( isAnyMigrationFlow( flow ) || intent === 'import' ) {
			return (
				<MigrationTrialAcknowledge flow={ flow } stepName={ stepName } navigation={ navigation } />
			);
		}

		return (
			<HostingTrialAcknowledge flow={ flow } navigation={ navigation } stepName={ stepName } />
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
