export type Activity = {
	activityId: number;
	activityTs: number;
	activityName: string;
	activityTitle: string;
	activityDescription: [
		{
			intent?: string;
			section?: string;
			type?: string;
			url?: string;
		}
	];
	activityMedia: {
		available: boolean;
		name: string;
		medium_url: string;
		thumbnail_url: string;
	};
	activityIcon?: string;
	actorAvatarUrl?: string;
	actorName?: string;
	actorRole?: string;
	actorType?: string;
	rewindId?: string;
};
