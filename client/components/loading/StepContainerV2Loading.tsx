import { Step } from '@automattic/onboarding';
import { type ReactNode } from 'react';

export const StepContainerV2Loading = ( {
	title,
	progress,
}: {
	title?: ReactNode;
	progress?: number;
} ) => {
	return <Step.Loading title={ title } progress={ progress } />;
};
