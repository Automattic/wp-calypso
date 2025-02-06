import { NEWSLETTER_FLOW, LINK_IN_BIO_TLD_FLOW } from '@automattic/onboarding';
import { useI18n } from '@wordpress/react-i18n';
import PropTypes from 'prop-types';
import { useRef, useState, useEffect } from 'react';
import JetpackLogo from 'calypso/components/jetpack-logo';
import { StepperLoader } from 'calypso/landing/stepper/declarative-flow/internals/components';
import { useInterval } from 'calypso/lib/interval/use-interval';
import './style.scss';

// Default estimated time to perform "loading"
const DURATION_IN_MS = 6000;

const useSteps = ( flowName: string ) => {
	const { __ } = useI18n();
	let steps = [];

	switch ( flowName ) {
		case LINK_IN_BIO_TLD_FLOW:
			steps = [
				{ title: __( 'Great choices. Nearly there!' ) },
				{ title: __( 'Shining and polishing your Bio' ) },
				{ title: __( 'Mounting it on a marble pedestal' ) },
			];
			break;
		case NEWSLETTER_FLOW:
			steps = [
				{ title: __( 'Excellent choices. Nearly there!' ) },
				{
					title: __( 'Spreading the news' ),
				},
				{
					title: __( 'Folding the letters' ),
				},
				{
					title: __( 'Bringing the news to the letter' ),
				},
			];

			break;
		default:
			steps = [
				{ title: __( 'Turning on the lights' ) },
				{ title: __( 'Making you cookies' ) },
				{ title: __( 'Planning the next chess move' ) },
			];
	}

	return useRef< { title: string; duration?: number }[] >( steps.filter( Boolean ) );
};

export default function TailoredFlowPreCheckoutScreen( { flowName }: { flowName: string } ) {
	const steps = useSteps( flowName );
	const totalSteps = steps.current.length;

	const [ currentStep, setCurrentStep ] = useState( 0 );

	const defaultDuration = DURATION_IN_MS / totalSteps;
	const duration = steps.current[ currentStep ]?.duration || defaultDuration;

	// Force animated progress bar to start at 0
	const [ hasStarted, setHasStarted ] = useState( false );
	useEffect( () => {
		const id = setTimeout( () => setHasStarted( true ), 750 );
		return () => clearTimeout( id );
	}, [] );

	// Temporarily override document styles to prevent scrollbars from showing
	useEffect( () => {
		document.documentElement.classList.add( 'no-scroll' );
		return () => {
			document.documentElement.classList.remove( 'no-scroll' );
		};
	}, [] );
	/**
	 * Completion progress: 0 <= progress <= 100
	 */
	const progress = ! hasStarted
		? /* initial 10% progress */ 10
		: ( ( currentStep + 1 ) * 100 ) / totalSteps;
	const isComplete = progress >= 100;

	useInterval(
		() => setCurrentStep( ( s ) => s + 1 ),
		// Enable the interval when progress is incomplete.
		isComplete ? null : duration
	);

	return (
		<>
			<StepperLoader title={ steps.current[ currentStep ]?.title } progress={ progress } />
			{ flowName === NEWSLETTER_FLOW && (
				<div className="processing-step__jetpack-powered">
					<JetpackLogo monochrome size={ 18 } /> <span>Jetpack powered</span>
				</div>
			) }
		</>
	);
}

TailoredFlowPreCheckoutScreen.propTypes = {
	flowName: PropTypes.string,
};
