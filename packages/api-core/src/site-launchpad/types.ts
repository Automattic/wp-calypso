export interface LaunchpadTask {
	completed: boolean;
}

export interface Launchpad {
	checklist?: LaunchpadTask[] | null;
}
