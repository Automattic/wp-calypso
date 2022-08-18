import { useI18n } from '@wordpress/react-i18n';
import PropTypes from 'prop-types';
import { useRef, useState, useEffect } from 'react';
import JetpackLogo from 'calypso/components/jetpack-logo';
import { useInterval } from 'calypso/lib/interval/use-interval';
import './style.scss';

// Default estimated time to perform "loading"
const DURATION_IN_MS = 6000;

const useSteps = ( flowName ) => {
	const { __ } = useI18n();
	let steps = [];

	switch ( flowName ) {
		case 'newsletter':
		case 'link-in-bio':
			steps = [
				{ title: __( 'Saving your preferences' ) },
				{ title: __( 'Getting your Domain' ) },
				{ title: __( 'Adding your Plan' ) },
				{ title: __( 'Preparing Checkout' ) },
			];
			break;
		default:
			steps = [
				{ title: __( 'Turning on the lights' ) },
				{ title: __( 'Making you cookies' ) },
				{ title: __( 'Planning the next chess move' ) },
			];
	}

	return useRef( steps.filter( Boolean ) );
};

export default function TailoredFlowProcessingScreen( { flowName } ) {
	const steps = useSteps( flowName );
	const totalSteps = steps.current.length;

	const [ currentStep, setCurrentStep ] = useState( 0 );

	const defaultDuration = DURATION_IN_MS / totalSteps;
	const duration = steps.current[ currentStep ]?.duration || defaultDuration;

	/**
	 * Completion progress: 0 <= progress <= 1
	 */
	const progress = ( currentStep + 1 ) / totalSteps;
	const isComplete = progress >= 1;

	useInterval(
		() => setCurrentStep( ( s ) => s + 1 ),
		// Enable the interval when progress is incomplete.
		isComplete ? null : duration
	);

	// Force animated progress bar to start at 0
	const [ hasStarted, setHasStarted ] = useState( false );
	useEffect( () => {
		const id = setTimeout( () => setHasStarted( true ), 750 );
		return () => clearTimeout( id );
	}, [] );

	return (
		<div className="reskinned-processing-screen__container">
			<div className={ 'reskinned-processing-screen' }>
				<h1 className="reskinned-processing-screen__progress-step">
					{ steps.current[ currentStep ]?.title }
				</h1>
				<div
					className="reskinned-processing-screen__progress-bar"
					style={ {
						'--progress': ! hasStarted ? /* initial 10% progress */ 0.1 : progress,
					} }
				/>
			</div>

			<div className="reskinned-processing-screen__jetpack-powered">
				<JetpackLogo monochrome size={ 18 } /> <span>Jetpack powered</span>
			</div>
		</div>
	);
}

TailoredFlowProcessingScreen.propTypes = {
	flowName: PropTypes.string,
};
