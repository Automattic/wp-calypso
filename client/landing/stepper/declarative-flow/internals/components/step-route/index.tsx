import { useSelect } from '@wordpress/data';
import clsx from 'clsx';
import { useEffect } from 'react';
import { useLoginUrlForFlow } from 'calypso/landing/stepper/hooks/use-login-url-for-flow';
import { STEPPER_INTERNAL_STORE } from 'calypso/landing/stepper/stores';
import kebabCase from 'calypso/landing/stepper/utils/kebabCase';
import { StepperPerformanceTrackerStop } from 'calypso/landing/stepper/utils/performance-tracking';
import SignupHeader from 'calypso/signup/signup-header';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { PRIVATE_STEPS } from '../../steps';
import SurveyManager from '../survery-manager';
import { useStepRouteTracking } from './hooks/use-step-route-tracking';
import type { Flow, Navigate, StepperStep } from '../../types';
import type { StepperInternalSelect } from '@automattic/data-stores';

type StepRouteProps = {
	step: StepperStep;
	flow: Flow;
	showWooLogo: boolean;
	renderStep: ( step: StepperStep ) => JSX.Element | null;
	navigate: Navigate< StepperStep[] >;
};

// TODO: Check we can move RenderStep function to here and remove the renderStep prop
const StepRoute = ( { step, flow, showWooLogo, renderStep, navigate }: StepRouteProps ) => {
	const userIsLoggedIn = useSelector( isUserLoggedIn );
	const stepContent = renderStep( step );
	const stepData = useSelect(
		( select ) => ( select( STEPPER_INTERNAL_STORE ) as StepperInternalSelect ).getStepData(),
		[]
	);

	const loginUrl = useLoginUrlForFlow( { flow } );
	const shouldAuthUser = step.requiresLoggedInUser && ! userIsLoggedIn;
	const shouldSkipRender = shouldAuthUser || ! stepContent;

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

	if ( useBuiltItInAuth && shouldAuthUser && ! userIsLoggedIn ) {
		// If the current step requires the auth, it should become a next step after the auth.
		const extraData = {
			previousStep: stepData?.previousStep,
			nextStep: step.slug,
		};

		navigate( PRIVATE_STEPS.USER.slug, extraData, true );
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
					<SignupHeader pageTitle={ flow.title } showWooLogo={ showWooLogo } />
					{ stepContent }
					<SurveyManager flow={ flow } />
					<StepperPerformanceTrackerStop flow={ flow.name } step={ step.slug } />
				</>
			) }
		</div>
	);
};

export default StepRoute;
