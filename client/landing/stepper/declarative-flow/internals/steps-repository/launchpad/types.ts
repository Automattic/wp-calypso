export interface Task {
	id: string;
	isCompleted: boolean;
	actionUrl: string;
	taskType: string;
	title: string;
	displayBadge: boolean;
	badgeText: string;
}

export interface LaunchpadFlowTaskList {
	[ string: string ]: string[];
}

export interface TranslatedLaunchpadStrings {
	sidebarTitle: string;
	flowName: string;
}
