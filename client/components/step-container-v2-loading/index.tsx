import { Step } from '@automattic/onboarding';
import { ProgressBar } from '@wordpress/components';
import './style.scss';

export const StepContainerV2Loading = ( {
	title,
	progress,
}: {
	title?: string;
	progress?: number;
} ) => {
	return (
		<Step.FullWidthLayout
			topBar={ <Step.TopBar /> }
			heading={ title && <Step.Heading text={ title } size="small" align="center" /> }
			verticalAlign="center"
			className="step-container-v2--loading"
		>
			<ProgressBar className="step-container-v2--loading__progress-bar" value={ progress } />
		</Step.FullWidthLayout>
	);
};
