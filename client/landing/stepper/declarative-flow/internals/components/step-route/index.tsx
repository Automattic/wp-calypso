import { isEnabled } from '@automattic/calypso-config';
import { ProgressBar } from '@automattic/components';
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
}: StepRouteProps ) => {
	const renderProgressBar = () => {
		// The visual progress bar is removed due to its fragility.
		// The component will be cleaned up but it'll require more untangling as the component
		// is involved in some framework mechanisms and Tracks events
		// See https://github.com/Automattic/dotcom-forge/issues/3160

		if ( ! isEnabled( 'onboarding/stepper-loading-bar' ) ) {
			return null;
		}

		return (
			<ProgressBar
				// eslint-disable-next-line wpcalypso/jsx-classname-namespace
				className="flow-progress"
				value={ progressValue * 100 }
				total={ 100 }
				style={ progressBarExtraStyle }
			/>
		);
	};

	return (
		<div
			className={ classnames(
				flow.name,
				flow.variantSlug,
				flow.classnames,
				kebabCase( step.slug )
			) }
		>
			{
				! isEnabled( 'videopress-onboarding-user-intent' ) &&
					'videopress' === flow.name &&
					'intro' === step.slug && (
						<VideoPressIntroBackground />
					) /* Temporary disbale intro background while we run videopress-onboarding-intent as intro page */
			}
			{ renderProgressBar() }
			<SignupHeader pageTitle={ flow.title } showWooLogo={ showWooLogo } />
			{ renderStep( step ) }
		</div>
	);
};

export default StepRoute;
