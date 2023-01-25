import {
	StepContainer,
	isNewsletterOrLinkInBioFlow,
	isLinkInBioFlow,
	isFreeFlow,
	ECOMMERCE_FLOW,
	isWooExpressFlow,
} from '@automattic/onboarding';
import { useSelect } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect, useState } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import { LoadingBar } from 'calypso/components/loading-bar';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useInterval } from 'calypso/lib/interval';
import useCaptureFlowException from '../../../../hooks/use-capture-flow-exception';
import { useProcessingLoadingMessages } from './hooks/use-processing-loading-messages';
import { useVideoPressLoadingMessages } from './hooks/use-videopress-loading-messages';
import TailoredFlowPreCheckoutScreen from './tailored-flow-precheckout-screen';
import type { StepProps } from '../../types';
import './style.scss';

export enum ProcessingResult {
	NO_ACTION = 'no-action',
	SUCCESS = 'success',
	FAILURE = 'failure',
}

interface ProcessingStepProps extends StepProps {
	title?: string;
	subtitle?: string;
}

const ProcessingStep: React.FC< ProcessingStepProps > = function ( props ) {
	const { submit } = props.navigation;
	const { flow } = props;

	const { __ } = useI18n();
	const videoPressLoadingMessages = useVideoPressLoadingMessages();
	const defaultLoadingMessages = useProcessingLoadingMessages();
	const loadingMessages =
		'videopress' === flow ? videoPressLoadingMessages : defaultLoadingMessages;

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

	// When the hasActionSuccessfullyRun flag turns on, run submit().
	useEffect( () => {
		if ( hasActionSuccessfullyRun ) {
			submit?.( destinationState, ProcessingResult.SUCCESS );
		}
		// A change in submit() doesn't cause this effect to rerun.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ hasActionSuccessfullyRun ] );

	const flowName = props.flow || '';
	const isJetpackPowered = isNewsletterOrLinkInBioFlow( flowName );
	const isWooCommercePowered = flowName === ECOMMERCE_FLOW;

	// Currently we have the Domains and Plans only for link in bio
	if ( isLinkInBioFlow( flowName ) || isFreeFlow( flowName ) ) {
		return <TailoredFlowPreCheckoutScreen flowName={ flowName } />;
	}

	return (
		<>
			<DocumentHead title={ __( 'Processing' ) } />
			<StepContainer
				shouldHideNavButtons={ true }
				hideFormattedHeader={ true }
				stepName="processing-step"
				stepContent={
					<>
						<div className="processing-step">
							<h1 className="processing-step__progress-step">{ getCurrentMessage() }</h1>
							{ progress >= 0 || isWooExpressFlow( flow ) ? (
								<LoadingBar
									progress={ progress }
									className="processing-step__content woocommerce-install__content"
								/>
							) : (
								<LoadingEllipsis />
							) }
							{ props.subtitle && <p className="processing-step__subtitle">{ props.subtitle }</p> }
						</div>
					</>
				}
				stepProgress={ stepProgress }
				recordTracksEvent={ recordTracksEvent }
				showJetpackPowered={ isJetpackPowered }
				showFooterWooCommercePowered={ isWooCommercePowered }
			/>
		</>
	);
};

export default ProcessingStep;
