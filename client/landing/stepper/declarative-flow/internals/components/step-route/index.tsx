import clsx from 'clsx';
import { useEffect } from 'react';
import { useLoginUrlForFlow } from 'calypso/landing/stepper/hooks/use-login-url-for-flow';
import kebabCase from 'calypso/landing/stepper/utils/kebabCase';
import { StepperPerformanceTrackerStop } from 'calypso/landing/stepper/utils/performance-tracking';
import SignupHeader from 'calypso/signup/signup-header';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import SurveyManager from '../survery-manager';
import { useStepRouteTracking } from './hooks/use-step-route-tracking';
import type { Flow, Navigate, StepperStep } from '../../types';

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
		navigate( 'user', undefined, true );
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
					<SurveyManager disabled />
					<StepperPerformanceTrackerStop flow={ flow.name } step={ step.slug } />
				</>
			) }
		</div>
	);
};

export default StepRoute;
