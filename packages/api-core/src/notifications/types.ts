export interface NotificationRange {
	type: string;
	indices: [ number, number ];
	id?: string | number;
	parent?: string | number | null;
	url?: string;
}

export interface NotificationMedia {
	type: string;
	indices: [ number, number ];
	url: string;
}

export interface NotificationBlock {
	text: string;
	type?: string;
	ranges?: NotificationRange[];
	media?: NotificationMedia[];
}

export interface NotificationNote {
	id: number;
	type: string;
	read: number;
	timestamp: string;
	icon: string;
	title: string;
	meta?: {
		ids?: {
			site?: number;
			post?: number;
			comment?: number;
			reply_comment?: number;
		};
	};
	subject: NotificationBlock[];
	header?: NotificationBlock[];
	body: NotificationBlock[];
}

export interface FetchNotificationsParams {
	type?: string;
	number?: number;
	fields?: string;
	locale?: string;
}

export interface NotificationsResponse {
	notes?: NotificationNote[];
}
