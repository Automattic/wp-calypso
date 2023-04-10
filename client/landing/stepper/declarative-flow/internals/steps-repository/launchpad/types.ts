export interface Task {
	id: string;
	completed: boolean;
	disabled: boolean;
	title?: string;
	subtitle?: string;
	badgeText?: string;
	actionDispatch?: () => void;
	isLaunchTask?: boolean;
	warning?: boolean;
}

export interface LaunchpadFlowTaskList {
	[ string: string ]: string[];
}

export interface TranslatedLaunchpadStrings {
	flowName: string;
	title: string;
	launchTitle?: string;
	subtitle: string;
}

export interface LaunchpadStatuses {
	links_edited?: boolean;
	site_edited?: boolean;
	site_launched?: boolean;
	first_post_published?: boolean;
	video_uploaded?: boolean;
	publish_first_course?: boolean;
	plan_completed?: boolean;
	domain_upsell_deferred?: boolean;
}

export interface LaunchpadResponse {
	site_intent: string;
	launchpad_screen: boolean | string;
	checklist_statuses: LaunchpadStatuses[];
}
