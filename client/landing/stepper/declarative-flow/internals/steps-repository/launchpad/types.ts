export interface Task {
	id: string;
	isCompleted: boolean;
	actionUrl: string;
	taskType: string;
	displayBadge: boolean;
	badgeText: string;
}

export interface LaunchpadFlowTaskList {
	[ string: string ]: string[];
}

export interface TranslatedLaunchpadStrings {
	flowName: string;
	sidebarTitle: string;
	sidebarSubtitle: string;
}
