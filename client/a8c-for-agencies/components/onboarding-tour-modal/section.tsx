import { ReactNode } from 'react';

export type OnboardingTourModalSectionProps = {
	id: string;
	title: string;
	children: ReactNode;
};

export default function OnboardingTourModalSection( {
	children,
}: OnboardingTourModalSectionProps ) {
	return <div className="onboarding-tour-modal__section">{ children }</div>;
}
