/**
 * External dependencies
 */
import React from 'react';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@automattic/react-i18n';
import { useInterval } from 'calypso/lib/interval/use-interval';

/**
 * Style dependencies
 */
import './style.scss';

// Total time to perform "loading"
const DURATION_IN_MS = 6000;

/**
 * This component is cloned from the CreateSite component of Gutenboarding flow
 * to work with the onboarding signup flow.
 */
export default function ReskinnedProcessingScreen( { hasPaidDomain } ) {
	const { __ } = useI18n();

	const steps = React.useRef(
		[
			__( 'Building your site' ),
			hasPaidDomain && __( 'Getting your domain' ),
			__( 'Applying design' ),
		].filter( Boolean )
	);
	const totalSteps = steps.current.length;

	const [ currentStep, setCurrentStep ] = React.useState( 0 );

	/**
	 * Completion progress: 0 <= progress <= 1
	 */
	const progress = ( currentStep + 1 ) / totalSteps;
	const isComplete = progress >= 1;

	useInterval(
		() => setCurrentStep( ( s ) => s + 1 ),
		// Enable the interval when progress is incomplete
		isComplete ? null : DURATION_IN_MS / totalSteps
	);

	// Force animated progress bar to start at 0
	const [ hasStarted, setHasStarted ] = React.useState( false );
	React.useEffect( () => {
		const id = setTimeout( () => setHasStarted( true ), 750 );
		return () => clearTimeout( id );
	}, [] );

	return (
		<div className="reskinned-processing-screen">
			<h1 className="reskinned-processing-screen__progress-step">
				{ steps.current[ currentStep ] }
			</h1>
			<div
				className="reskinned-processing-screen__progress-bar"
				style={ {
					'--progress': ! hasStarted ? /* initial 10% progress */ 0.1 : progress,
				} }
			/>
			<p className="reskinned-processing-screen__progress-numbered-steps">
				{
					// translators: these are progress steps. Eg: step 1 of 4.
					sprintf( __( 'Step %(currentStep)d of %(totalSteps)d' ), {
						currentStep: currentStep + 1,
						totalSteps,
					} )
				}
			</p>
		</div>
	);
}
