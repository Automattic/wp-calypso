import clsx from 'clsx';
import kebabCase from 'calypso/landing/stepper/utils/kebabCase';
import { StepperPerformanceTrackerStop } from 'calypso/landing/stepper/utils/performance-tracking';
import SignupHeader from 'calypso/signup/signup-header';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import VideoPressIntroBackground from '../../steps-repository/intro/videopress-intro-background';
import UserStep from '../user';
import { useStepRouteTracking } from './hooks/use-step-route-tracking';
import type { Flow, StepperStep } from '../../types';

type StepRouteProps = {
	step: StepperStep;
	flow: Flow;
	showWooLogo: boolean;
	renderStep: ( step: StepperStep ) => JSX.Element | null;
};

// TODO: Check we can move RenderStep function to here and remove the renderStep prop
const StepRoute = ( { step, flow, showWooLogo, renderStep }: StepRouteProps ) => {
	const userIsLoggedIn = useSelector( isUserLoggedIn );
	const stepContent = renderStep( step );
	const shouldRedirectToLogin = step.requiresLoggedInUser && ! userIsLoggedIn;
	const skipTracking = shouldRedirectToLogin || ! stepContent;

	useStepRouteTracking( {
		flowName: flow.name,
		stepSlug: step.slug,
		skipTracking,
		flowVariantSlug: flow.variantSlug,
	} );

	if ( shouldRedirectToLogin && ! userIsLoggedIn ) {
		return (
			<div className={ clsx( 'step-route', 'user', flow.name, flow.variantSlug, flow.classnames ) }>
				<SignupHeader pageTitle={ flow.title } showWooLogo={ showWooLogo } />
				<UserStep flow={ flow.name } />
			</div>
		);
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
			{ stepContent && <SignupHeader pageTitle={ flow.title } showWooLogo={ showWooLogo } /> }
			{ stepContent }
			{ stepContent && <StepperPerformanceTrackerStop flow={ flow.name } step={ step.slug } /> }
		</div>
	);
};

export default StepRoute;
