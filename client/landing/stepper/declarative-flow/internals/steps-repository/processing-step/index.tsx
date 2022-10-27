import {
	StepContainer,
	isNewsletterOrLinkInBioFlow,
	LINK_IN_BIO_FLOW,
} from '@automattic/onboarding';
import { useSelect } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect, useState } from 'react';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useInterval } from 'calypso/lib/interval';
import useCaptureFlowException from '../../../../hooks/use-capture-flow-exception';
import { useProcessingLoadingMessages } from './hooks/use-processing-loading-messages';
import TailoredFlowPreCheckoutScreen from './tailored-flow-precheckout-screen';
import type { Step } from '../../types';
import './style.scss';

export enum ProcessingResult {
	NO_ACTION = 'no-action',
	SUCCESS = 'success',
	FAILURE = 'failure',
}

const ProcessingStep: Step = function ( props ) {
	const { submit } = props.navigation;

	const { __ } = useI18n();
	const loadingMessages = useProcessingLoadingMessages();

	const [ currentMessageIndex, setCurrentMessageIndex ] = useState( 0 );
	const [ hasActionSuccessfullyRun, setHasActionSuccessfullyRun ] = useState( false );
	const [ destinationState, setDestinationState ] = useState( {} );

	useInterval( () => {
		setCurrentMessageIndex( ( s ) => ( s + 1 ) % loadingMessages.length );
	}, loadingMessages[ currentMessageIndex ]?.duration );

	const action = useSelect( ( select ) => select( ONBOARD_STORE ).getPendingAction() );
	const progress = useSelect( ( select ) => select( ONBOARD_STORE ).getProgress() );
	const progressTitle = useSelect( ( select ) => select( ONBOARD_STORE ).getProgressTitle() );
	const stepProgress = useSelect( ( select ) => select( ONBOARD_STORE ).getStepProgress() );

	const getCurrentMessage = () => {
		return progressTitle || loadingMessages[ currentMessageIndex ]?.title;
	};

	const captureFlowException = useCaptureFlowException( 'ProcessingStep' );

	useEffect( () => {
		if ( action ) {
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
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ action ] );

	// When the hasActionSuccessfullyRun flag turns on, run submit().
	useEffect( () => {
		if ( hasActionSuccessfullyRun ) {
			submit?.( destinationState, ProcessingResult.SUCCESS );
		}
		// A change in submit() doesn't cause this effect to rerun.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ hasActionSuccessfullyRun ] );

	// Progress smoothing, works out to be around 40seconds unless step polling dictates otherwise
	const [ simulatedProgress, setSimulatedProgress ] = useState( 0 );

	useEffect( () => {
		let timeoutReference: NodeJS.Timeout;
		if ( progress >= 0 ) {
			timeoutReference = setTimeout( () => {
				if ( progress > simulatedProgress || progress === 1 ) {
					setSimulatedProgress( progress );
				} else if ( simulatedProgress < 1 ) {
					setSimulatedProgress( ( previousProgress ) => {
						let newProgress = previousProgress + Math.random() * 0.04;
						// Stall at 95%, allow complete to finish up
						if ( newProgress >= 0.95 ) {
							newProgress = 0.95;
						}
						return newProgress;
					} );
				}
			}, 1000 );
		}

		return () => clearTimeout( timeoutReference );
	}, [ simulatedProgress, progress, __ ] );

	const flowName = props.flow || '';
	const isJetpackPowered = isNewsletterOrLinkInBioFlow( flowName );

	// Currently we have the Domains and Plans only for link in bio
	if ( flowName === LINK_IN_BIO_FLOW ) {
		return <TailoredFlowPreCheckoutScreen flowName={ flowName } />;
	}

	return (
		<StepContainer
			shouldHideNavButtons={ true }
			hideFormattedHeader={ true }
			stepName="processing-step"
			isHorizontalLayout={ true }
			stepContent={
				<div className="processing-step">
					<h1 className="processing-step__progress-step">{ getCurrentMessage() }</h1>
					{ progress >= 0 ? (
						<div className="processing-step__content woocommerce-install__content">
							<div
								className="processing-step__progress-bar"
								style={
									{
										'--progress': simulatedProgress > 1 ? 1 : simulatedProgress,
									} as React.CSSProperties
								}
							/>
						</div>
					) : (
						<LoadingEllipsis />
					) }
				</div>
			}
			stepProgress={ stepProgress }
			recordTracksEvent={ recordTracksEvent }
			showJetpackPowered={ isJetpackPowered }
		/>
	);
};

export default ProcessingStep;
