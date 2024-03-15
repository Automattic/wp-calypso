import { StepContainer, isNewHostedSiteCreationFlow } from '@automattic/onboarding';
import { useEffect } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useDispatch, useSelector } from 'calypso/state';
import { getCurrentUserId, isCurrentUserEmailVerified } from 'calypso/state/current-user/selectors';
import { savePreference } from 'calypso/state/preferences/actions';
import { HostingTrialAcknowledge } from './hosting-trial-acknowledge';
import { MigrationTrialAcknowledge } from './migration-trial-acknowledge';
import type { Step } from 'calypso/landing/stepper/declarative-flow/internals/types';
import './style.scss';

const TrialAcknowledge: Step = function TrialAcknowledge( { navigation, flow, stepName } ) {
	const { goBack } = navigation;
	const dispatch = useDispatch();
	const userId = useSelector( getCurrentUserId );
	const isEmailVerified = useSelector( isCurrentUserEmailVerified );
	const pathStep = isEmailVerified ? null : `/setup/${ flow }/${ stepName }`;

	/**
	 * Save the selected trial plan path in the user's preferences.
	 */
	const saveHostingFlowPathStep = () => {
		dispatch( savePreference( `hosting-flow-path-step-${ userId }`, pathStep ) );
	};

	useEffect( () => {
		saveHostingFlowPathStep();
	}, [ pathStep ] );

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
