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
