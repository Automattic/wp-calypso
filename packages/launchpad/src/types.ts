export interface TaskExtraData {
	about_page_id?: number;
}
export interface Task {
	id: string;
	completed: boolean;
	disabled: boolean;
	title?: string;
	subtitle?: string | React.ReactNode | null;
	badge_text?: string;
	actionDispatch?: () => void;
	isLaunchTask?: boolean;
	extra_data?: TaskExtraData;
	calypso_path?: string;
	target_repetitions?: number;
	repetition_count?: number;
	order?: number;
	useCalypsoPath?: boolean;
}

export type LaunchpadChecklist = Task[];

export type LaunchpadTracksData = {
	checklistSlug: string;
	launchpadContext: string;
	recordTracksEvent: ( event: string, properties: Record< string, unknown > ) => void;
	tasklistCompleted: boolean;
};

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

export interface PermittedActions {
	setShareSiteModalIsOpen?: ( isOpen: boolean ) => void;
	siteLaunched?: () => void;
	setActiveChecklist: ( siteSlug: string, activeChecklistSlug: string ) => void;
}

export type EventHandlers = {
	onSiteLaunched?: () => void;
};

export interface LaunchpadTaskActionsProps {
	siteSlug: string | null;
	tasks: Task[];
	tracksData: LaunchpadTracksData;
	extraActions: PermittedActions;
	uiContext?: 'calypso';
	eventHandlers?: EventHandlers;
}
