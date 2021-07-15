export type Activity = {
	streams: Activity[];
	rewindId?: string;
	activityIsRewindable: boolean;
};
