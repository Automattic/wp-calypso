export type ActivityDescriptionPart = {
	children: string[];
	intent?: string;
	section?: string;
	type: string;
};

export type LogItemType = {
	activityId: string;
	activityTitle: string;
	activityStatus: string;
	activityDate: string;
	activityDescription: ActivityDescriptionPart[];
	activityName: string;
};

export type LogData = {
	state: string;
	data: LogItemType[];
};
