import clsx from 'clsx';
import { PropsWithChildren, useEffect } from 'react';
import { useLoginUrlForFlow } from 'calypso/landing/stepper/hooks/use-login-url-for-flow';
import kebabCase from 'calypso/landing/stepper/utils/kebabCase';
import SignupHeader from 'calypso/signup/signup-header';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import VideoPressIntroBackground from '../../steps-repository/intro/videopress-intro-background';
import { useStepRouteTracking } from './hooks/use-step-route-tracking';
import type { Flow, StepperStep } from '../../types';

interface StepRouteProps extends PropsWithChildren {
	step: StepperStep;
	flow: Flow;
	showWooLogo: boolean;
}

const StepRoute = ( { step, flow, showWooLogo, children }: StepRouteProps ) => {
	const userIsLoggedIn = useSelector( isUserLoggedIn );
	const loginUrl = useLoginUrlForFlow( { flow } );
	const shouldRedirectToLogin = step.requiresLoggedInUser && ! userIsLoggedIn;
	const shouldSkipRender = shouldRedirectToLogin || ! children;

	useStepRouteTracking( {
		flowName: flow.name,
		stepSlug: step.slug,
		skipTracking: shouldSkipRender,
	} );

	useEffect( () => {
		if ( shouldRedirectToLogin ) {
			window.location.assign( loginUrl );
		}
	}, [ loginUrl, shouldRedirectToLogin ] );

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
			{ 'videopress' === flow.name && 'intro' === step.slug && <VideoPressIntroBackground /> }
			{ children && <SignupHeader pageTitle={ flow.title } showWooLogo={ showWooLogo } /> }
			{ children }
		</div>
	);
};

export default StepRoute;
