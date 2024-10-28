//TODO: Temporary export until we can replace all dependencies with ./types.ts Task;
export type { Task } from '@automattic/launchpad';
import { type ChecklistStatuses, type SiteDetails } from '@automattic/data-stores';
import { type Task } from '@automattic/launchpad';
import { type MinimalRequestCartProduct } from '@automattic/shopping-cart';
import { QueryClient } from '@tanstack/react-query';
import { Dispatch, SetStateAction, type ReactNode } from 'react';
import { type NavigationControls } from '../../types';

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

// TODO: Convert this type to enum, because union string doesnt protect from duplicates or typos;
//
export type TaskId =
	| 'setup_free'
	| 'setup_newsletter'
	| 'setup_blog'
	| 'blog_launched'
	| 'site_launched'
	| 'design_selected'
	| 'design_completed'
	| 'verify_email'
	| 'design_edited'
	| 'domain_upsell'
	| 'first_post_published'
	| 'first_post_published_newsletter'
	| 'subscribers_added'
	| 'plan_selected'
	| 'plan_completed'
	| 'newsletter_plan_created'
	| 'setup_link_in_bio'
	| 'link_in_bio_launched'
	| 'migrate_content'
	| 'links_added'
	| 'set_up_payments';

export interface TaskContext {
	tasks: Task[];
	site: SiteDetails | null;
	checklistStatuses?: ChecklistStatuses;
	isEmailVerified: boolean;
	planCartItem?: MinimalRequestCartProduct | null;
	domainCartItem?: MinimalRequestCartProduct | null;
	productCartItems?: MinimalRequestCartProduct[] | null;
	siteSlug: string | null;
	submit: NavigationControls[ 'submit' ];
	displayGlobalStylesWarning: boolean;
	hasSkippedCheckout: boolean;
	globalStylesMinimumPlan: string;
	translatedPlanName?: ReactNode | string;
	goToStep?: NavigationControls[ 'goToStep' ];
	stripeConnectUrl?: string;
	//TODO: Remove it refactoring the task-definitions/plan completePaidNewsletterTask function
	queryClient: QueryClient;
	//TODO: Temporarially used as reference until future refactor
	setShowPlansModal: Dispatch< SetStateAction< boolean > >;
}

export type TaskAction = ( task: Task, flow: string, context: TaskContext ) => Task;
export type TaskActionTable = Record< TaskId, TaskAction >;
