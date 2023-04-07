import { ProgressBar } from '@automattic/components';
import { SITE_SETUP_FLOW } from '@automattic/onboarding';
import classnames from 'classnames';
import kebabCase from 'calypso/landing/stepper/utils/kebabCase';
import SignupHeader from 'calypso/signup/signup-header';
import VideoPressIntroBackground from '../../steps-repository/intro/videopress-intro-background';
import { Flow, StepperStep } from '../../types';

type StepRouteProps = {
	step: StepperStep;
	flow: Flow;
	progressValue: number;
	progressBarExtraStyle: React.CSSProperties;
	showWooLogo: boolean;
	renderStep: ( step: StepperStep ) => JSX.Element;
};

const StepRoute = ( {
	step,
	flow,
	progressValue,
	progressBarExtraStyle,
	showWooLogo,
	renderStep,
}: StepRouteProps ) => (
	<div
		className={ classnames( flow.name, flow.variantSlug, flow.classnames, kebabCase( step.slug ) ) }
	>
		{ 'videopress' === flow.name && 'intro' === step.slug && <VideoPressIntroBackground /> }
		{ flow.name !== SITE_SETUP_FLOW && (
			// The progress bar is removed from the site-setup due to its fragility.
			// See https://github.com/Automattic/wp-calypso/pull/73653
			<ProgressBar
				// eslint-disable-next-line wpcalypso/jsx-classname-namespace
				className="flow-progress"
				value={ progressValue * 100 }
				total={ 100 }
				style={ progressBarExtraStyle }
			/>
		) }
		<SignupHeader pageTitle={ flow.title } showWooLogo={ showWooLogo } />
		{ renderStep( step ) }
	</div>
);

export default StepRoute;
