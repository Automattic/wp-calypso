// FUTURE WORK: universal typings location
// FUTURE WORK: investigate shape of this object
// FUTURE WORK: type this as soon as it comes back from the API
export interface Activity {
	activityDescription: [
		{
			intent?: string;
			section?: string;
			type?: string;
			url?: string;
			published?: number;
		},
	];
	activityIcon?: string;
	activityId: number;
	activityMedia: {
		available: boolean;
		medium_url: string;
		name: string;
		thumbnail_url: string;
		type: string;
		url: string;
	};
	activityName: string;
	activityStatus: string;
	activityTitle: string;
	activityTs: number;

	actorAvatarUrl?: string;
	actorName?: string;
	actorRole?: string;
	actorType?: string;

	activityIsRewindable: boolean;
	rewindId?: string;
	streams?: Activity[];
}
