import type { useOpeningCoordinates } from './hooks/use-opening-coordinates';
import type { HelpCenterSite, SiteDetails } from '@automattic/data-stores';
import type { ReactElement } from 'react';

export interface Container {
	handleClose: () => void;
	defaultFooterContent?: ReactElement;
	isLoading?: boolean;
	hidden?: boolean;
	currentRoute?: string;
	openingCoordinates?: ReturnType< typeof useOpeningCoordinates >;
}

export interface ArticleContentProps {
	content: string | undefined;
	title: string | undefined;
	link: string | undefined;
	isLoading?: boolean;
	postId: number;
	blogId?: string | null;
	slug?: string;
}

export interface Header {
	isMinimized?: boolean;
	onMinimize?: () => void;
	onMaximize?: () => void;
	onDismiss: () => void;
}

export interface SitePicker {
	ownershipResult: AnalysisReport;
	isSelfDeclaredSite: boolean;
	onSelfDeclaredSite: ( selfDeclared: boolean ) => void;
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

export interface TailoredArticles {
	post_ids: Array< number >;
	blog_id: number;
	locale: string;
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
	is_presales_chat_open: boolean;
	is_precancellation_chat_open: boolean;
	force_email_support: boolean;
}

interface Eligibility {
	is_user_eligible: boolean;
	support_level:
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
}

export interface SupportStatus {
	eligibility: Eligibility;
	availability: Availability;
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

export type ContactOption = 'chat' | 'email';
