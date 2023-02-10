import type { HelpCenterSite, AnalysisReport } from '@automattic/data-stores';
import type { ReactElement } from 'react';

export interface Container {
	handleClose: () => void;
	defaultFooterContent?: ReactElement;
	isLoading?: boolean;
	hidden?: boolean;
}

export interface Header {
	isMinimized?: boolean;
	onMinimize?: () => void;
	onMaximize?: () => void;
	onDismiss: () => void;
}

export interface SitePicker {
	ownershipResult: AnalysisReport;
	setSitePickerChoice: any;
	sitePickerChoice: string;
	currentSite: HelpCenterSite | undefined;
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
	url?: { pathname: string; search: string } | string;
	is_external?: boolean;
}

export interface FeatureFlags {
	loadNextStepsTutorial: boolean;
}

export interface SearchResult {
	link: string;
	title: string | React.ReactChild;
	content?: string;
	icon?: string;
	post_id?: number;
	blog_id?: number;
}

export interface SupportTicket {
	id?: number;
	status: string;
	subject: string;
	time: Date;
	timestamp: number;
	type: string;
	url: string;
	when: string;
}

export type Mode = 'CHAT' | 'EMAIL' | 'FORUM';
