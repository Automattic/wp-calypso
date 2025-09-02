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
	summary: string;
}

export interface ActivityLog {
	current?: {
		orderedItems: ActivityLogEntry[];
	};
}
