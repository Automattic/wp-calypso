export interface BlockAttributesV1 {
	estimate: string;
	team: string;
}

export interface BlockAttributes {
	allTasks: number;
	completedTasks: number;
	estimate: string;
	pendingTasks: number;
	team: string;
}

export interface SelectAttributes {
	allTasksLive: number;
	completedTasksLive: number;
	pendingTasksLive: number;
}
