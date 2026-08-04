import { useSelect } from '@wordpress/data';
import clsx from 'clsx';
import { useEffect, type JSX } from 'react';
import { useLoginUrlForFlow } from 'calypso/landing/stepper/hooks/use-login-url-for-flow';
import { STEPPER_INTERNAL_STORE } from 'calypso/landing/stepper/stores';
import kebabCase from 'calypso/landing/stepper/utils/kebabCase';
import { StepperPerformanceTrackerStop } from 'calypso/landing/stepper/utils/performance-tracking';
import SignupHeader from 'calypso/signup/signup-header';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { PRIVATE_STEPS } from '../../steps';
import { useEmailVerificationGate } from '../../steps-repository/__user/use-email-verification-gate';
import SurveyManager from '../survey-manager';
import { useStepRouteTracking } from './hooks/use-step-route-tracking';
import type { Flow, FlowV2, Navigate, StepperStep } from '../../types';
import type { StepperInternalSelect } from '@automattic/data-stores';

type StepRouteProps = {
	step: StepperStep;
	flow: Flow | FlowV2< any >;
	renderStep: ( step: StepperStep ) => JSX.Element | null;
	navigate: Navigate;
};

// TODO: Check we can move RenderStep function to here and remove the renderStep prop
const StepRoute = ( { step, flow, renderStep, navigate }: StepRouteProps ) => {
	const userIsLoggedIn = useSelector( isUserLoggedIn );
	const stepContent = renderStep( step );
	const stepData = useSelect(
		( select ) => ( select( STEPPER_INTERNAL_STORE ) as StepperInternalSelect ).getStepData(),
		[]
	);

	const loginUrl = useLoginUrlForFlow( { flow } );
	const shouldAuthUser = step.requiresLoggedInUser && ! userIsLoggedIn;
	// Being logged in isn't on its own enough to enter a protected step. `pending` counts as well
	// as `gated`: on the first render the user object hasn't arrived, and letting that through is
	// how an unverified user gets in. Elsewhere the hook answers `clear` and nothing changes.
	const { status: emailVerificationStatus } = useEmailVerificationGate( flow.name );
	const mustVerifyEmail =
		step.requiresLoggedInUser &&
		userIsLoggedIn &&
		( emailVerificationStatus === 'gated' || emailVerificationStatus === 'pending' );
	const shouldSkipRender = shouldAuthUser || mustVerifyEmail || ! stepContent;

	const useBuiltItInAuth = flow.__experimentalUseBuiltinAuth;

	useStepRouteTracking( {
		flow,
		stepSlug: step.slug,
		skipStepRender: shouldSkipRender,
	} );

	useEffect( () => {
		if ( shouldAuthUser && ! useBuiltItInAuth ) {
			window.location.assign( loginUrl );
		}
	}, [ loginUrl, shouldAuthUser, useBuiltItInAuth ] );

	if ( useBuiltItInAuth && ( shouldAuthUser || mustVerifyEmail ) ) {
		// Whichever sent them there, the step they asked for is where they go afterwards.
		navigate(
			PRIVATE_STEPS.USER.slug,
			{ previousStep: stepData?.previousStep, nextStep: step.slug },
			true
		);
		return null;
	}

	if ( shouldSkipRender ) {
		return null;
	}

	return (
		<div
			className={ clsx(
				'step-route',
				flow.name,
				flow.variantSlug,
				flow.classnames,
				kebabCase( step.slug )
			) }
		>
			{ stepContent && (
				<>
					<SignupHeader pageTitle={ flow.title } />
					{ stepContent }
					<SurveyManager flow={ flow } />
					<StepperPerformanceTrackerStop flow={ flow.name } step={ step.slug } />
				</>
			) }
		</div>
	);
};

export default StepRoute;
