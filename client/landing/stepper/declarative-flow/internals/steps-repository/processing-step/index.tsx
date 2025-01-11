import {
	StepContainer,
	isNewsletterOrLinkInBioFlow,
	isFreeFlow,
	isNewSiteMigrationFlow,
	isUpdateDesignFlow,
	ECOMMERCE_FLOW,
	isWooExpressFlow,
	isTransferringHostedSiteCreationFlow,
	HUNDRED_YEAR_DOMAIN_FLOW,
	HUNDRED_YEAR_PLAN_FLOW,
	isAnyHostingFlow,
} from '@automattic/onboarding';
import { useSelect } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect, useState, useRef } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import { LoadingBar } from 'calypso/components/loading-bar';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import availableFlows from 'calypso/landing/stepper/declarative-flow/registered-flows';
import { useRecordSignupComplete } from 'calypso/landing/stepper/hooks/use-record-signup-complete';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordSignupProcessingScreen } from 'calypso/lib/analytics/signup';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useInterval } from 'calypso/lib/interval';
import getWccomFrom from 'calypso/state/selectors/get-wccom-from';
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
	const [ hasEmptyActionRun, setHasEmptyActionRun ] = useState( false );
	const [ destinationState, setDestinationState ] = useState( {} );

	/**
	 * There is a long-term bug here that the `submit` function will be called multiple times if we
	 * call `resetOnboardStoreWithSkipFlags` after the submit function (e.g.: exitFlow) to reset states
	 * that are listed as the dependencies of the `recordSignupComplete`, e.g.: goals, selectedDesign, etc.
	 *
	 * Here is a possible flow:
	 * 1. The Design Picker step submits, sets a pending action, and goes to this step
	 * 2. Run the pending action, and then submit first
	 * 3. The `submit` may trigger the `exitFlow` function that is defined by each flow
	 * 4. The `exitFlow` function may set another pending action, and call `resetOnboardStoreWithSkipFlags` function
	 * 5. The effect to call the `submit` runs again since the `recordSignupComplete` function changes
	 *
	 * It's also a reason why we have a hacky to set a pending action to return a Promise that is never resolved.
	 *
	 * To resolve this issue, we define a flag to avoid calling the submit function multiple times.
	 *
	 * Another way is to remove the recordSignupComplete function from the dependencies of the effect that
	 * is called when the hasActionSuccessfullyRun flag turns on. But it seems to be better to use an explicit
	 * flag to avoid the issue and describe it here.
	 */
	const isSubmittedRef = useRef( false );

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
				setHasEmptyActionRun( true );
			}
		} )();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ action ] );

	// As for hasActionSuccessfullyRun, in this case we submit the no action result.
	useEffect( () => {
		if ( hasEmptyActionRun && ! isSubmittedRef.current ) {
			// Let's ensure the submit function is called only once,
			// but only for the onboarding flow to mitigate risks.
			isSubmittedRef.current = flow === 'site-setup' ? true : false;
			submit?.( {}, ProcessingResult.NO_ACTION );
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ hasEmptyActionRun ] );

	// When the hasActionSuccessfullyRun flag turns on, run submit() and fire the sign-up completion event.
	useEffect( () => {
		if ( hasActionSuccessfullyRun && ! isSubmittedRef.current ) {
			// We should only trigger signup completion for signup flows, so check if we have one.
			if ( availableFlows[ flow ] ) {
				availableFlows[ flow ]().then( ( flowExport ) => {
					if ( flowExport.default.isSignupFlow ) {
						recordSignupComplete( { ...destinationState } );
					}
				} );
			}

			if ( isNewSiteMigrationFlow( flow ) ) {
				submit?.( { ...destinationState, ...props.data }, ProcessingResult.SUCCESS );
				return;
			}

			const { previousStep = '' } = props.data || {};

			recordSignupProcessingScreen( flow, previousStep, {
				is_in_hosting_flow: isAnyHostingFlow( flow ),
				wccom_from: getWccomFrom( destinationState ),
			} );

			// Let's ensure the submit function is called only once,
			// but only for the onboarding flow to mitigate risks.
			isSubmittedRef.current = flow === 'site-setup' ? true : false;

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

	if ( [ HUNDRED_YEAR_PLAN_FLOW, HUNDRED_YEAR_DOMAIN_FLOW ].includes( flowName ) ) {
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
