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
	activityId: number;
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

export interface ActivityBlockNode {
	type?: string;
	text?: string | null;
	children?: ActivityBlockContent[];
	// these are all optional and depend on the type of node
	url?: string | null;
	// the activity field was mostly referenced as a data attribute for links.
	// we now check it elsewhere so downstream consumers can rely on the data when present.
	activity?: string;
	section?: string;
	intent?: string;
	siteId?: number | string;
	postId?: number | string;
	isTrashed?: boolean;
	commentId?: number | string;
	name?: string;
	siteSlug?: string;
	pluginSlug?: string;
	themeUri?: string;
	themeSlug?: string;
}

export type ActivityBlockContent = string | ActivityBlockNode;

export interface ActivityContent {
	text?: string;
	items?: ActivityBlockContent[];
}
