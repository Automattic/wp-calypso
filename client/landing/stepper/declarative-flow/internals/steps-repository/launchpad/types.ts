export interface Task {
	id: TaskId;
	completed: boolean;
	disabled: boolean;
	title?: string;
	subtitle?: string;
	badgeText?: string;
	actionDispatch?: () => void;
	isLaunchTask?: boolean;
	warning?: boolean;
}

export type TaskId =
	| 'links_edited'
	| 'site_edited'
	| 'site_launched'
	| 'first_post_published'
	| 'video_uploaded'
	| 'publish_first_course'
	| 'plan_completed'
	| 'domain_upsell_deferred';

export interface LaunchpadFlowTaskList {
	[ string: string ]: string[];
}

export interface TranslatedLaunchpadStrings {
	flowName: string;
	title: string;
	launchTitle?: string;
	subtitle: string;
}

export type LaunchpadChecklist = Array< Task >;

export interface LaunchpadResponse {
	site_intent: string;
	launchpad_screen: boolean | string;
	checklist_statuses: LaunchpadChecklist[];
}
