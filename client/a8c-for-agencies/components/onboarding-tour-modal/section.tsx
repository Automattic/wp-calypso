import { ReactNode } from 'react';

export type ActionProps = {
	variant: 'primary' | 'secondary';
	onClick?: () => void;
	href?: string;
	disabled?: boolean;
	isBusy?: boolean;
	label: string;
};

export type RenderableAction = ActionProps | ReactNode;

export type RenderableActionProps = {
	onClose: () => void;
	onNext: () => void;
};

export type OnboardingTourModalSectionProps = {
	id: string;
	title: string;
	bannerImage: string;
	isDarkBanner?: boolean;
	renderableActions?: ( props: RenderableActionProps ) => RenderableAction[];
	children: ReactNode;
};

export default function OnboardingTourModalSection( {
	children,
}: OnboardingTourModalSectionProps ) {
	return <div className="onboarding-tour-modal__section">{ children }</div>;
}
