import type { SiteDetails } from '@automattic/data-stores';
import type { ReactElement } from 'react';

export interface Container {
	handleClose: () => void;
	defaultFooterContent?: ReactElement;
	isLoading?: boolean;
}

export interface Content {
	isMinimized: boolean;
}

export interface Header {
	isMinimized?: boolean;
	onMinimize?: () => void;
	onMaximize?: () => void;
	onDismiss: () => void;
}
export interface SitePicker {
	currentSite: SiteDetails | undefined;
	onSelect: ( siteId: number | string ) => void;
	siteId: string | number | null | undefined;
	enabled: boolean;
}

// ended means the user closed the popup or reloaded the iframe
export type WindowState = 'open' | 'closed' | 'blurred' | 'ended';

export interface Article {
	title: string;
	link?: string;
	icon?: string;
	id?: string;
	post_id?: string;
	blog_id?: string;
}

export interface FeatureFlags {
	loadNextStepsTutorial: boolean;
}
