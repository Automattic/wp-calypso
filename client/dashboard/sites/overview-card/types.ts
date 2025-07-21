import type { ReactElement, ReactNode } from 'react';

export interface OverviewCardSummaryProps {
	title: string;
	customHeading?: ReactNode;
	description?: string;
	heading?: ReactNode;
	icon?: ReactElement;
	linkIcon?: ReactElement;
}

export interface OverviewCardLinkProps {
	link: string;
	tracksId?: string;
	variant?: OverviewCardVariant;
	isExternal?: boolean;
	onClick?: () => void;
	children: ReactNode;
}

export type OverviewCardVariant = 'upsell' | 'disabled' | 'loading' | 'success' | 'error';
