import { ACCOUNT_FLOW, HOSTING_LP_FLOW, ENTREPRENEUR_FLOW } from '@automattic/onboarding';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import { useRef, useState, useEffect } from 'react';
import Loading from 'calypso/components/loading';
import { useInterval } from 'calypso/lib/interval/use-interval';
import './style.scss';

// Default estimated time to perform "loading"
const DURATION_IN_MS = 6000;

interface ProcessingScreenProps {
	flowName?: string;
	hasPaidDomain?: boolean;
	isDestinationSetupSiteFlow?: boolean;
}

interface Step {
	title: string;
	duration?: number;
}

const useSteps = ( {
	flowName,
	hasPaidDomain,
	isDestinationSetupSiteFlow,
}: ProcessingScreenProps ) => {
	const { __ } = useI18n();
	let steps: Step[] = [];

	switch ( flowName ) {
		case 'launch-site':
			steps = [ { title: __( 'Your site will be live shortly.' ) } ]; // copy from 'packages/launch/src/focused-launch/success'
			break;
		case 'domain':
			steps = [ { title: __( 'Preparing your domain' ) } ];
			break;
		case 'site-content-collection':
			steps = [ { title: __( 'Saving your content' ) }, { title: __( 'Closing the loop' ) } ];
			break;
		case 'onboarding-with-email':
			steps = [
				{ title: __( 'Getting your domain' ) },
				{ title: __( 'Turning on the lights' ) },
				{ title: __( 'Making you cookies' ) },
				{ title: __( 'Planning the next chess move' ) },
			];
			break;
		case ACCOUNT_FLOW:
		case HOSTING_LP_FLOW:
		case ENTREPRENEUR_FLOW:
			steps = [ { title: __( 'Creating your account' ) } ];
			break;
		case 'setup-site':
			// Custom durations give a more believable loading effect while setting up
			// the site with headstart. Which can take quite a long time.
			steps = [
				{ title: __( 'Laying the foundations' ), duration: 7000 },
				{ title: __( 'Turning on the lights' ), duration: 3000 },
				{ title: __( 'Making it beautiful' ), duration: 4000 },
				{ title: __( 'Personalizing your site' ), duration: 7000 },
				{ title: __( 'Sprinkling some magic' ), duration: 4000 },
				{ title: __( 'Securing your data' ), duration: 9000 },
				{ title: __( 'Enabling encryption' ), duration: 3000 },
				{ title: __( 'Optimizing your content' ), duration: 6000 },
				{ title: __( 'Applying a shiny top coat' ), duration: 4000 },
				{ title: __( 'Closing the loop' ) },
			];
			break;
		case 'do-it-for-me':
		case 'do-it-for-me-store':
			steps = [
				{ title: __( 'Saving your selections' ), duration: 7000 },
				{ title: __( 'Turning on the lights' ), duration: 3000 },
				{ title: __( 'Planning the next chess move' ), duration: 4000 },
				{ title: __( 'Making you cookies' ), duration: 9000 },
				{ title: __( 'Closing the loop' ) },
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
			].filter( Boolean ) as Step[];
	}

	return useRef( steps );
};

// This component is cloned from the CreateSite component of Gutenboarding flow
// to work with the onboarding signup flow.
export default function ProcessingScreen( props: ProcessingScreenProps ) {
	const { __ } = useI18n();

	const steps = useSteps( props );
	const totalSteps = steps.current.length;

	const [ currentStep, setCurrentStep ] = useState( 0 );

	const defaultDuration = DURATION_IN_MS / totalSteps;
	const duration =
		( steps.current[ currentStep ] && steps.current[ currentStep ]?.duration ) || defaultDuration;

	/**
	 * Completion progress: 0 <= progress <= 1
	 */
	const progress = ( ( currentStep + 1 ) / totalSteps ) * 100;
	const isComplete = progress >= 100;

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

	const progressValue = ! hasStarted ? /* initial 10% progress */ 10 : progress;

	return (
		<div
			className={ clsx( 'processing-screen', {
				'is-force-centered': totalSteps === 0,
			} ) }
		>
			<Loading
				title={ steps.current[ currentStep ]?.title }
				progress={ progressValue }
				subtitle={
					totalSteps > 1 &&
					// translators: these are progress steps. Eg: step 1 of 4.
					sprintf( __( 'Step %(currentStep)d of %(totalSteps)d' ), {
						currentStep: currentStep + 1,
						totalSteps,
					} )
				}
			/>
		</div>
	);
}
