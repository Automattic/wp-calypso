import {
	StepContainer,
	isNewsletterOrLinkInBioFlow,
	isFreeFlow,
	isNewSiteMigrationFlow,
	isUpdateDesignFlow,
	ECOMMERCE_FLOW,
	isWooExpressFlow,
	isTransferringHostedSiteCreationFlow,
	HUNDRED_YEAR_PLAN_FLOW,
} from '@automattic/onboarding';
import { useSelect } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect, useState } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import { LoadingBar } from 'calypso/components/loading-bar';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import availableFlows from 'calypso/landing/stepper/declarative-flow/registered-flows';
import { useRecordSignupComplete } from 'calypso/landing/stepper/hooks/use-record-signup-complete';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useInterval } from 'calypso/lib/interval';
import useCaptureFlowException from '../../../../hooks/use-capture-flow-exception';
import { ProcessingResult } from './constants';
import { useProcessingLoadingMessages } from './hooks/use-processing-loading-messages';
import HundredYearPlanFlowProcessingScreen from './hundred-year-plan-flow-processing-screen';
import TailoredFlowPreCheckoutScreen from './tailored-flow-precheckout-screen';
import type { StepProps } from '../../types';
import type { OnboardSelect } from '@automattic/data-stores';
import './style.scss';
interface ProcessingStepProps extends StepProps {
	title?: string;
	subtitle?: string;
}

const ProcessingStep: React.FC< ProcessingStepProps > = function ( props ) {
	const { submit } = props.navigation;
	const { flow } = props;

	const { __ } = useI18n();
	const loadingMessages = useProcessingLoadingMessages( flow );

	const [ currentMessageIndex, setCurrentMessageIndex ] = useState( 0 );
	const [ hasActionSuccessfullyRun, setHasActionSuccessfullyRun ] = useState( false );
	const [ destinationState, setDestinationState ] = useState( {} );

	const recordSignupComplete = useRecordSignupComplete( flow );

	useInterval(
		() => {
			setCurrentMessageIndex( ( s ) => ( s + 1 ) % loadingMessages.length );
		},
		loadingMessages[ currentMessageIndex ]?.duration
	);

	const action = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getPendingAction(),
		[]
	);
	const progress = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getProgress(),
		[]
	);
	const progressTitle = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getProgressTitle(),
		[]
	);

	const getCurrentMessage = () => {
		return props.title || progressTitle || loadingMessages[ currentMessageIndex ]?.title;
	};

	const captureFlowException = useCaptureFlowException( props.flow, 'ProcessingStep' );

	useEffect( () => {
		( async () => {
			if ( typeof action === 'function' ) {
				try {
					const destination = await action();
					// Don't call submit() directly; instead, turn on a flag that signals we should call submit() next.
					// This allows us to call the newest submit() created. Otherwise, we would be calling a submit()
					// that is frozen from before we called action().
					// We can now get the most up to date values from hooks inside the flow creating submit(),
					// including the values that were updated during the action() running.
					setDestinationState( destination );
					setHasActionSuccessfullyRun( true );
				} catch ( e ) {
					// eslint-disable-next-line no-console
					console.error( 'ProcessingStep failed:', e );
					captureFlowException( e );
					submit?.( {}, ProcessingResult.FAILURE );
				}
			} else {
				submit?.( {}, ProcessingResult.NO_ACTION );
			}
		} )();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ action ] );

	// When the hasActionSuccessfullyRun flag turns on, run submit() and fire the sign-up completion event.
	useEffect( () => {
		if ( hasActionSuccessfullyRun ) {
			// We should only trigger signup completion for signup flows, so check if we have one.
			if ( availableFlows[ flow ] ) {
				availableFlows[ flow ]().then( ( flowExport ) => {
					if ( flowExport.default.isSignupFlow ) {
						recordSignupComplete();
					}
				} );
			}

			if ( isNewSiteMigrationFlow( flow ) ) {
				submit?.( { ...destinationState, ...props.data }, ProcessingResult.SUCCESS );
				return;
			}

			// Default processing handler.
			submit?.( destinationState, ProcessingResult.SUCCESS );
		}
		// A change in submit() doesn't cause this effect to rerun.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ hasActionSuccessfullyRun, recordSignupComplete, flow ] );

	const getSubtitle = () => {
		return props.subtitle || loadingMessages[ currentMessageIndex ]?.subtitle;
	};

	const flowName = props.flow || '';
	const isJetpackPowered = isNewsletterOrLinkInBioFlow( flowName );
	const isWooCommercePowered = flowName === ECOMMERCE_FLOW;

	// Return tailored processing screens for flows that need them
	if (
		isNewsletterOrLinkInBioFlow( flowName ) ||
		isFreeFlow( flowName ) ||
		isUpdateDesignFlow( flowName )
	) {
		return <TailoredFlowPreCheckoutScreen flowName={ flowName } />;
	}

	if ( HUNDRED_YEAR_PLAN_FLOW === flowName ) {
		return <HundredYearPlanFlowProcessingScreen />;
	}

	const subtitle = getSubtitle();

	return (
		<>
			<DocumentHead title={ __( 'Processing' ) } />
			<StepContainer
				shouldHideNavButtons
				hideFormattedHeader
				stepName="processing-step"
				stepContent={
					<>
						<div className="processing-step">
							<h1 className="processing-step__progress-step">{ getCurrentMessage() }</h1>
							{ progress >= 0 ||
							isWooExpressFlow( flow ) ||
							isTransferringHostedSiteCreationFlow( flow ) ? (
								<LoadingBar
									progress={ progress }
									className="processing-step__content woocommerce-install__content"
								/>
							) : (
								<LoadingEllipsis />
							) }
							{ subtitle && <p className="processing-step__subtitle">{ subtitle }</p> }
						</div>
					</>
				}
				recordTracksEvent={ recordTracksEvent }
				showJetpackPowered={ isJetpackPowered }
				showFooterWooCommercePowered={ isWooCommercePowered }
			/>
		</>
	);
};

export default ProcessingStep;
