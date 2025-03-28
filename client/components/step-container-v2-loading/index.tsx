import { Step } from '@automattic/onboarding';

export const StepContainerV2Loading = ( {
	title,
	progress,
}: {
	title?: string;
	progress?: number;
} ) => {
	return <Step.Loading title={ title } progress={ progress } />;
};
