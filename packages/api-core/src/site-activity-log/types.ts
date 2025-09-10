export interface ActivityLogEntry {
	activity_id: string;
	actor: {
		type: 'Person' | 'Application'; // What else?
		name: string;
		external_user_id?: number;
		wpcom_user_id?: number;
		icon?: ActivityLogIcon;
		role?: string;
		is_cli?: boolean;
	};
	content: {
		text: string;
	};
	type: 'Announce'; // What else?
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
export interface ActivityLogIcon {
	type: 'Image';
	url: string;
	width: number;
	height: number;
}

export interface ActivityLog {
	current?: {
		orderedItems: ActivityLogEntry[];
	};
}
