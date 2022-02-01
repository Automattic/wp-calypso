import { useI18n } from '@wordpress/react-i18n';
import { ReactElement, useState, useEffect } from 'react';
import StepContent from './step-content';

export default function Progress( { progress }: { progress: number } ): ReactElement {
	const { __ } = useI18n();
	const [ step, setStep ] = useState( __( 'Building your store' ) );

	// Progress smoothing, works out to be around 40seconds unless step polling dictates otherwise
	const [ simulatedProgress, setSimulatedProgress ] = useState( 0.01 );
	useEffect( () => {
		const timeoutReference = setTimeout( () => {
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

		if ( simulatedProgress >= 0.8 || progress >= 0.8 ) {
			setStep( __( 'Turning on the lights' ) );
		} else if ( simulatedProgress >= 0.6 || progress >= 0.6 ) {
			setStep( __( 'Last paint touchups' ) );
		} else if ( simulatedProgress >= 0 ) {
			setStep( __( 'Building your store' ) );
		}

		return () => clearTimeout( timeoutReference );
	}, [ simulatedProgress, progress, __ ] );

	return (
		<StepContent title={ step }>
			<div
				className="transfer__progress-bar"
				style={
					{ '--progress': simulatedProgress > 1 ? 1 : simulatedProgress } as React.CSSProperties
				}
			/>
		</StepContent>
	);
}
