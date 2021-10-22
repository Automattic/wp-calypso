import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import { useRef, useState, useEffect } from 'react';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { useInterval } from 'calypso/lib/interval/use-interval';
import './style.scss';

// Total time to perform "loading"
const DURATION_IN_MS = 6000;
const HEADSTART_DURATION_IN_MS = 80000;

const useSteps = ( { flowName, hasPaidDomain, isDestinationSetupSiteFlow } ) => {
	const { __ } = useI18n();
	let steps = [];

	switch ( flowName ) {
		case 'launch-site':
			steps = [ __( 'Your site will be live shortly.' ) ]; // copy from 'packages/launch/src/focused-launch/success'
			break;
		case 'setup-site':
			steps = [
				__( 'Personalizing your site' ),
				__( 'Applying your theme' ),
				__( 'Turning on hosting' ),
				__( 'Enabling SSL encryption' ),
				__( 'Switching on email' ),
				__( 'Applying Jetpack essentials' ),
				__( 'Adding a domain' ),
				__( 'Applying a plan' ),
				__( 'Securing your information' ),
				__( 'Optimizing your content' ),
				__( 'Closing the loop' ),
			];
			break;
		default:
			steps = [
				! isDestinationSetupSiteFlow && __( 'Building your site' ),
				hasPaidDomain && __( 'Getting your domain' ),
				! isDestinationSetupSiteFlow && __( 'Applying design' ),
			];
	}

	return useRef( steps.filter( Boolean ) );
};

// This component is cloned from the CreateSite component of Gutenboarding flow
// to work with the onboarding signup flow.
export default function ReskinnedProcessingScreen( props ) {
	const { __ } = useI18n();

	const steps = useSteps( props );
	const { isDestinationSetupSiteFlow, flowName } = props;
	const totalSteps = steps.current.length;
	const shouldShowNewSpinner = isDestinationSetupSiteFlow || flowName === 'setup-site';

	const duration = flowName === 'setup-site' ? HEADSTART_DURATION_IN_MS : DURATION_IN_MS;
	const [ currentStep, setCurrentStep ] = useState( 0 );

	/**
	 * Completion progress: 0 <= progress <= 1
	 */
	const progress = ( currentStep + 1 ) / totalSteps;
	const isComplete = progress >= 1;

	useInterval(
		() => setCurrentStep( ( s ) => s + 1 ),
		// Enable the interval when progress is incomplete
		isComplete ? null : duration / totalSteps
	);

	// Force animated progress bar to start at 0
	const [ hasStarted, setHasStarted ] = useState( false );
	useEffect( () => {
		const id = setTimeout( () => setHasStarted( true ), 750 );
		return () => clearTimeout( id );
	}, [] );

	return (
		<div
			className={ classnames( 'reskinned-processing-screen', {
				'is-force-centered': shouldShowNewSpinner && totalSteps === 0,
			} ) }
		>
			<h1 className="reskinned-processing-screen__progress-step">
				{ steps.current[ currentStep ] }
			</h1>
			{ shouldShowNewSpinner && <LoadingEllipsis /> }
			{ ! shouldShowNewSpinner && (
				<>
					<div
						className="reskinned-processing-screen__progress-bar"
						style={ {
							'--progress': ! hasStarted ? /* initial 10% progress */ 0.1 : progress,
						} }
					/>
					{ totalSteps > 1 && (
						<p className="reskinned-processing-screen__progress-numbered-steps">
							{
								// translators: these are progress steps. Eg: step 1 of 4.
								sprintf( __( 'Step %(currentStep)d of %(totalSteps)d' ), {
									currentStep: currentStep + 1,
									totalSteps,
								} )
							}
						</p>
					) }
				</>
			) }
		</div>
	);
}

ReskinnedProcessingScreen.propTypes = {
	flowName: PropTypes.string,
	hasPaidDomain: PropTypes.bool,
	isDestinationSetupSiteFlow: PropTypes.bool,
};
