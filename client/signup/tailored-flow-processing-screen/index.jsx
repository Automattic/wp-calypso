import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import { useRef, useState, useEffect } from 'react';
import JetpackLogo from 'calypso/components/jetpack-logo';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { useInterval } from 'calypso/lib/interval/use-interval';
import './style.scss';

// Default estimated time to perform "loading"
const DURATION_IN_MS = 6000;

const useSteps = ( { flowName, hasPaidDomain, isDestinationSetupSiteFlow } ) => {
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
				! isDestinationSetupSiteFlow && { title: __( 'Building your site' ) },
				hasPaidDomain && { title: __( 'Getting your domain' ) },
				! isDestinationSetupSiteFlow && { title: __( 'Applying design' ) },
				{ title: __( 'Turning on the lights' ) },
				{ title: __( 'Making you cookies' ) },
				{ title: __( 'Planning the next chess move' ) },
			];
	}

	return useRef( steps.filter( Boolean ) );
};

// This component is cloned from the CreateSite component of Gutenboarding flow
// to work with the onboarding signup flow.
export default function ReskinnedProcessingScreen( props ) {
	const { __ } = useI18n();

	const steps = useSteps( props );
	const { isDestinationSetupSiteFlow } = props;
	const totalSteps = steps.current.length;
	const shouldShowNewSpinner = isDestinationSetupSiteFlow;

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
			<div
				className={ classnames( 'reskinned-processing-screen', {
					'is-force-centered': shouldShowNewSpinner && totalSteps === 0,
				} ) }
			>
				<h1 className="reskinned-processing-screen__progress-step">
					{ steps.current[ currentStep ]?.title }
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

			<div className="reskinned-processing-screen__jetpack-powered">
				<JetpackLogo monochrome size={ 18 } /> <span>Jetpack powered</span>
			</div>
		</div>
	);
}

ReskinnedProcessingScreen.propTypes = {
	flowName: PropTypes.string,
	hasPaidDomain: PropTypes.bool,
	isDestinationSetupSiteFlow: PropTypes.bool,
};
