export interface Task {
	id: string;
	completed: boolean;
	disabled: boolean;
	taskType: string;
	title?: string;
	badgeText?: string;
	actionDispatch?: () => void;
	isLaunchTask?: boolean;
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
