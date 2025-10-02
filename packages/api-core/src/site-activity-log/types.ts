export interface ActivityLogEntry {
	activity_id: string;
	actor: ActivityActor;
	content: {
		text: string;
		ranges?: ActivityNotificationRange[];
	};
	type: 'Announce'; // What else?
	gridicon: string;
	image?: {
		available: boolean;
		medium_url: string;
		name: string;
		url: string;
	};
	last_published: string;
	name: string;
	generator?: ActivityGenerator;
	is_rewindable: boolean;
	object?: {
		backup_type?: string;
		rewind_id?: string;
		backup_stats?: string;
		backup_period?: number;
		backup_warnings?: string;
		backup_errors?: string;
		type?: string;
	};
	published: string;
	rewind_id: string;
	status: ActivityStatus;
	summary: string;
	streams: ActivityLogEntry[];
}
export interface ActivityLogIcon {
	type: 'Image';
	url: string;
	width: number;
	height: number;
}
export interface ActivityNotificationRange {
	// Node-local unique ID and parent reference
	id: string;
	parent?: string | null;
	// UCS-2 indices within `text` [start, end)
	indices: [ number, number ];
	// Optional presentational attributes
	style?: string;
	class?: string;
	section?: string;
	url?: string;
	type: string;
	intent?: string;
}

export interface ActivityLogResponse {
	current?: {
		orderedItems: ActivityLogEntry[];
	};
	totalItems: number;
	pages: number;
	itemsPerPage: number;
	totalPages: number;
}

export interface ActivityLogGroupCountResponse {
	groups: {
		[ group: string ]: {
			name: string;
			count: number;
		};
	};
	totalItems: number;
}

// Activity Log: shared primitives

export interface ActivityImage {
	type: 'Image';
	url: string;
	width?: number;
	height?: number;
}

export type ActivityStatus = 'error' | 'info' | 'success' | 'warning' | null;

export interface ActivityGenerator {
	jetpack_version?: string; // e.g., '12.3'
	blog_id: number;
}

export type ActivityActor = {
	// Typically 'Person'; can also be 'Application' or 'Happiness Engineer'
	type: 'Person' | 'Application' | 'Happiness Engineer';
	name: string;
	// Present for Person actors
	external_user_id?: number | string | null;
	wpcom_user_id?: number | null;
	role?: string;
	icon?: ActivityImage;
	// Flags used in actor detection
	is_cli?: boolean;
	is_happiness?: boolean;
};

export interface ActivityLogParams {
	after?: string;
	before?: string;
	sort_order?: 'asc' | 'desc';
	page?: number;
	aggregate?: boolean;
	action?: string;
	by?: string;
	date_range?: string;
	number?: number;
	not_group?: string;
	group?: string[];
	name?: string[];
	text_search?: string;
}

export interface SiteActivityLog extends ActivityLogEntry {
	id: string;
}

export interface ActivityLogsData {
	activityLogs: SiteActivityLog[];
	totalItems: number;
	pages: number;
	itemsPerPage: number;
	totalPages: number;
}
