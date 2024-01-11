import { ChecklistStatuses, type SiteDetails } from '@automattic/data-stores';
import { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import { ReactNode } from 'react';

export interface Task {
	id: string;
	completed: boolean;
	disabled: boolean;
	title?: string;
	subtitle?: string | React.ReactNode | null;
	badge_text?: string;
	actionDispatch?: () => void;
	isLaunchTask?: boolean;
	calypso_path?: string;
}

export type LaunchpadChecklist = Task[];

export interface LaunchpadFlowTaskList {
	[ string: string ]: string[];
}

export interface TranslatedLaunchpadStrings {
	flowName: string;
	title: string;
	launchTitle?: string;
	subtitle: string;
}

export interface EnhancedTask extends Omit< Task, 'badge_text' | 'title' > {
	useCalypsoPath?: boolean;
	badge_text?: ReactNode | string;
	title?: ReactNode | string;
	actionUrl?: string;
}

export type TaskId =
	| 'setup_free'
	| 'setup_blog'
	| 'setup_newsletter'
	| 'design_edited'
	| 'plan_selected'
	| 'plan_completed'
	| 'subscribers_added'
	| 'migrate_content'
	| 'first_post_published'
	| 'first_post_published_newsletter'
	| 'design_selected'
	| 'design_completed'
	| 'setup_general'
	| 'setup_link_in_bio'
	| 'links_added'
	| 'link_in_bio_launched'
	| 'site_launched'
	| 'blog_launched'
	| 'videopress_upload'
	| 'videopress_launched'
	| 'domain_upsell'
	| 'verify_email'
	| 'set_up_payments'
	| 'newsletter_plan_created';

export interface TaskContext {
	siteInfoQueryArgs?: { siteId?: number; siteSlug?: string | null };
	displayGlobalStylesWarning: boolean;
	shouldDisplayWarning?: boolean;
	globalStylesMinimumPlan?: string;
	isVideoPressFlowWithUnsupportedPlan?: boolean;
	site: SiteDetails | null;
	domainUpsellCompleted: boolean;
	isEmailVerified: boolean;
	tasks: Task[];
	checklistStatuses?: ChecklistStatuses;
	planCartItem?: MinimalRequestCartProduct | null;
	domainCartItem?: MinimalRequestCartProduct | null;
	productCartItems?: MinimalRequestCartProduct[] | null;
	completeLaunchSiteTask: ( task: Task ) => Promise< void >;
}

export type TaskAction = ( task: Task, flow: string, context: TaskContext ) => EnhancedTask;
export type TaskActionTable = Record< TaskId, TaskAction >;
