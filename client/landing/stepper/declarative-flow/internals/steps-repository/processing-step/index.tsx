import { useSelect } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import { ReactElement, useEffect, useState } from 'react';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { useInterval } from 'calypso/lib/interval';
import type { Step } from '../../types';
import './style.scss';

const ProcessingStep: Step = function ( props ): ReactElement | null {
	const { submit } = props.navigation;

	const { __ } = useI18n();
	const loadingMessages = [
		{ title: __( 'Laying the foundations' ), duration: 2000 },
		{ title: __( 'Turning on the lights' ), duration: 3000 },
		{ title: __( 'Making it beautiful' ), duration: 2000 },
		{ title: __( 'Personalizing your site' ), duration: 4000 },
		{ title: __( 'Sprinkling some magic' ), duration: 4000 },
		{ title: __( 'Securing your data' ), duration: 5000 },
		{ title: __( 'Enabling encryption' ), duration: 3000 },
		{ title: __( 'Optimizing your content' ), duration: 6000 },
		{ title: __( 'Applying a shiny top coat' ), duration: 4000 },
		{ title: __( 'Closing the loop' ), duration: 5000 },
	];

	const [ currentMessageIndex, setCurrentMessageIndex ] = useState( 0 );

	useInterval( () => {
		setCurrentMessageIndex( ( s ) => ( s + 1 ) % loadingMessages.length );
	}, loadingMessages[ currentMessageIndex ]?.duration );

	const action = useSelect( ( select ) => select( ONBOARD_STORE ).getPendingAction() );
	const progress = useSelect( ( select ) => select( ONBOARD_STORE ).getProgress() );
	const progressTitle = useSelect( ( select ) => select( ONBOARD_STORE ).getProgressTitle() );

	const getCurrentMessage = () => {
		return progressTitle || loadingMessages[ currentMessageIndex ]?.title;
	};

	useEffect( () => {
		( async () => {
			if ( typeof action === 'function' ) {
				await action();
			}
			submit?.();
		} )();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ action ] );

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

	return (
		<div className={ 'processing-step' }>
			<h1 className="processing-step__progress-step">{ getCurrentMessage() }</h1>
			{ progress >= 0 ? (
				<div className="processing-step__content woocommerce-install__content">
					<div
						className="processing-step__progress-bar"
						style={
							{ '--progress': simulatedProgress > 1 ? 1 : simulatedProgress } as React.CSSProperties
						}
					/>
				</div>
			) : (
				<LoadingEllipsis />
			) }
		</div>
	);
};

export default ProcessingStep;
