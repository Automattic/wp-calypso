import type { ReactNode } from 'react';

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

export type MenuItemType = {
	id: string;
	label: string;
};
