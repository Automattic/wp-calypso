export interface Task {
	id: string;
	completed: boolean;
	disabled: boolean;
	title?: string;
	subtitle?: string | React.ReactNode | null;
	badge_text?: string;
	actionDispatch?: ( force?: boolean ) => void;
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

export interface LaunchpadStatuses {
	links_edited?: boolean;
	site_edited?: boolean;
	site_launched?: boolean;
	first_post_published?: boolean;
	video_uploaded?: boolean;
	publish_first_course?: boolean;
	plan_selected?: boolean;
	plan_completed?: boolean;
	domain_upsell_deferred?: boolean;
}

export interface LaunchpadResponse {
	site_intent: string;
	launchpad_screen: boolean | string;
	checklist_statuses: LaunchpadStatuses[];
}
