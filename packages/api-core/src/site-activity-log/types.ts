export interface ActivityLogEntry {
	activity_id: string;
	actor: {
		name: string;
	};
	content: {
		text: string;
	};
	gridicon: string;
	name: string;
	published: string;
	rewind_id: string;
	summary: string;
}

export interface ActivityLog {
	current?: {
		orderedItems: ActivityLogEntry[];
	};
}
