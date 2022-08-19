export interface Task {
	id: string;
	isCompleted: boolean;
	actionUrl: string | undefined;
	taskType: string;
	title: string;
	displayBadge: boolean;
	badgeText: string;
}

export interface LaunchpadFlowTaskList {
	[ string: string ]: string[];
}
