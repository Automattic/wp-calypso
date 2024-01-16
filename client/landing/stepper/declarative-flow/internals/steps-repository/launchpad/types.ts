//TODO: Temporary export until we can replace all depencecies with ./types.ts Task;
export type { Task } from '@automattic/launchpad';
import { ChecklistStatuses, SiteDetails } from '@automattic/data-stores';
import { Task } from '@automattic/launchpad';

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
	| 'design_selected'
	| 'design_completed'
	| 'design_edited'
	| 'domain_upsell'
	| 'first_post_published';

export interface TaskContext {
	tasks: Task[];
	site: SiteDetails | null;
	siteInfoQueryArgs?: { siteId?: number; siteSlug?: string | null };
	checklistStatuses?: ChecklistStatuses;
	isEmailVerified?: boolean;
}

export type TaskAction = ( task: Task, flow: string, context: TaskContext ) => Task;
export type TaskActionTable = Record< TaskId, TaskAction >;
