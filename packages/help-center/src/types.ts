import type { HelpCenterSite, SiteDetails } from '@automattic/data-stores';
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
	sitePickerEnabled: boolean;
}

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
	title: string;
	content?: string;
	icon?: string;
	post_id?: number;
	blog_id?: number;
	source?: string;
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

export interface MessagingAuth {
	user: {
		jwt: string;
	};
}

export interface MessagingAvailability {
	is_available: boolean;
}

export type Mode = 'CHAT' | 'EMAIL' | 'FORUM';

interface Availability {
	presale: boolean;
	precancellation: boolean;
}

export interface ChatAvailability {
	locale: string;
	is_user_eligible: boolean;
	supportLevel:
		| 'free'
		| 'personal'
		| 'personal-with-legacy-chat'
		| 'starter'
		| 'premium'
		| 'pro'
		| 'business'
		| 'ecommerce'
		| 'jetpack-paid'
		| 'p2-plus';
	nickname: string;
	availability: Availability;
	is_presales_chat_open: boolean;
	is_precancellation_chat_open: boolean;
	wapuu_assistant_enabled: boolean;
}

export interface OtherSupportAvailability {
	is_user_eligible_for_upwork: boolean;
	is_user_eligible_for_tickets: boolean;
	is_user_eligible_for_chat: boolean;
}

export interface SupportActivity {
	id: number;
	status: string;
	subject: string;
	timestamp: number;
	channel: string;
}

type ResultType =
	| 'DISABLED'
	| 'LOADING'
	| 'OWNED_BY_USER'
	| 'WPORG'
	| 'UNKNOWN'
	| 'NOT_OWNED_BY_USER'
	| 'UNKNOWN';

export type AnalysisReport = {
	result: ResultType;
	site?: SiteDetails | HelpCenterSite;
	siteURL: string | undefined;
	isWpcom: boolean;
};
