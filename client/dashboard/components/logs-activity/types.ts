import type { ActivityBlockContent } from '../logs-activity-formatted-block/types';
export interface ActivityDescription {
	textDescription: string;
	items: ActivityBlockContent[];
}

export interface ActivityActorDetails {
	actorAvatarUrl?: string;
	actorName?: string;
	actorRole?: string;
	actorType?: string;
	isCli?: boolean;
	isSupport?: boolean;
}

export interface ActivityMediaDetails {
	available: boolean;
	medium_url: string;
	name: string;
	thumbnail_url: string;
	type: string;
	url: string;
}

export interface Activity {
	activityDescription: ActivityDescription;
	activityIcon?: string;
	activityId: string;
	activityMedia: ActivityMediaDetails;
	activityName: string;
	activityStatus: string;
	activityTitle: string;
	activityTs: number;
	activityUnparsedTs: string;
	activityActor: ActivityActorDetails;
	activityIsRewindable: boolean;
	rewindId?: string;
}

export interface ActivityContent {
	text?: string;
	items?: ActivityBlockContent[];
}
