export type WordPressMigrationFinding = {
	code: string;
	severity: 'warning' | 'failure';
	// Whether the next run moves past it (accept), or something has to change first (retry).
	resolution: 'accept' | 'retry';
	// What we suggest doing about it: how to fix one to retry, or an option alongside one to accept.
	suggested_action: 'connect_source' | 'change_source' | 'upgrade_plan' | null;
	label: string;
	message: string;
	data?: Record< string, unknown >;
};

export type WordPressMigrationStatus = {
	status: 'not_started' | 'running' | 'paused' | 'failed' | 'completed';
	phase: 'prepare-source' | 'prepare-destination' | 'preflight' | 'migration' | 'cleanup' | null;
	findings: WordPressMigrationFinding[];
	progress: { message: string } | null;
	source_url: string | null;
	started_at: string | null;
	completed_at: string | null;
	// Where the email announcing the finished migration is sent.
	notification_emails: string[];
	// Our team has taken the migration over, which the site's own migration state shows once it's read again.
	handed_off: boolean;
};

export type WordPressMigrationSourceConnection = {
	method: string;
};

export type WordPressMigrationSourceConnectionOption = WordPressMigrationSourceConnection & {
	key?: string | null;
	plugin_url?: string;
	install_url?: string;
	connect_url?: string;
	manual_url?: string;
	connected?: boolean;
};

export type WordPressMigrationConfiguration = {
	source_url: string | null;
	source_connection: WordPressMigrationSourceConnection | null;
	available_source_connections: WordPressMigrationSourceConnectionOption[];
};

export type WordPressMigrationConfigureParams = {
	source_url?: string;
	source_connection?: WordPressMigrationSourceConnection;
};

export type WordPressMigrationRunParams = {
	accept_findings?: string[];
};
