/**
 * External dependencies
 */
import * as React from 'react';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { useSelect } from '@wordpress/data';
import { useInterval } from '../../../../lib/interval/use-interval';

/**
 * Internal dependencies
 */
import { useSelectedPlan } from '../../hooks/use-selected-plan';
import { useTrackStep } from '../../hooks/use-track-step';
import { STORE_KEY } from '../../stores/onboard';

/**
 * Style dependencies
 */
import './style.scss';

// Total time to perform "loading"
const DURATION_IN_MS = 6000;

/* eslint-disable wpcalypso/jsx-classname-namespace */
const CreateSite: React.FunctionComponent = () => {
	const { __ } = useI18n();
	const hasPaidDomain = useSelect( ( select ) => select( STORE_KEY ).hasPaidDomain() );
	const plan = useSelectedPlan();

	const steps = React.useRef< string[] >(
		[
			__( 'Building your site' ),
			hasPaidDomain && ! plan?.isFree && __( 'Getting your domain' ),
			__( 'Applying design' ),
		].filter( Boolean ) as string[]
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

	useTrackStep( 'CreateSite' );

	// Force animated progress bar to start at 0
	const [ hasStarted, setHasStarted ] = React.useState( false );
	React.useEffect( () => {
		const id = setTimeout( () => setHasStarted( true ), 750 );
		return () => clearTimeout( id );
	}, [] );

	return (
		<div className="create-site">
			<h1 className="create-site__progress-step">{ steps.current[ currentStep ] }</h1>
			<div
				className="create-site__progress-bar"
				style={
					{
						'--progress': ! hasStarted ? /* initial 10% progress */ 0.1 : progress,
					} as React.CSSProperties
				}
			/>
			<p className="create-site__progress-numbered-steps">
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
};

export default CreateSite;
