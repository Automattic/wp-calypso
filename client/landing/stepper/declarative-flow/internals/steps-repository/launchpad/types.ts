import { ChecklistStatuses, type SiteDetails } from '@automattic/data-stores';
//TODO: Temporary export until we can replace all depencecies with ./types.ts Task;
export type { Task } from '@automattic/launchpad';
import { Task } from '@automattic/launchpad';
import { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import { NavigationControls } from '../../types';

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

export type TaskId =
	| 'setup_free'
	| 'design_edited'
	| 'design_completed'
	| 'design_selected'
	| 'domain_upsell'
	| 'first_post_published'
	| 'first_post_published_newsletter'
	| 'setup_blog'
	| 'setup_newsletter'
	| 'site_launched'
	| 'plan_selected';
//
// TODO: Add the rest of the task ids
// | 'plan_completed'
// | 'subscribers_added'
// | 'migrate_content'
// | 'setup_general'
// | 'setup_link_in_bio'
// | 'links_added'
// | 'link_in_bio_launched'
// | 'blog_launched'
// | 'videopress_upload'
// | 'videopress_launched'
// | 'verify_email'
// | 'set_up_payments'
// | 'newsletter_plan_created';

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
	siteSlug: string | null;
	submit: NavigationControls[ 'submit' ];
}

export type TaskAction = ( task: Task, flow: string, context: TaskContext ) => Task;
export type TaskActionTable = Record< TaskId, TaskAction >;
