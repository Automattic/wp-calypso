import type { OnboardingTourModalSectionProps } from './types';

export default function OnboardingTourModalSection( {
	children,
}: OnboardingTourModalSectionProps ) {
	return <div className="dashboard-onboarding-tour-modal__section">{ children }</div>;
}
