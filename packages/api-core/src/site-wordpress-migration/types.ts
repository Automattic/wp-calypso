export type WordPressMigrationFinding = {
	code: string;
	severity: 'warning' | 'failure';
	// What gets past the finding: continuing accepts it, or continuing only runs the same step again.
	resolution: 'accept' | 'retry';
	label: string;
	message: string;
	data?: Record< string, unknown >;
};

export type WordPressMigrationStatus = {
	status: 'not_started' | 'running' | 'paused' | 'failed' | 'completed';
	phase: 'prepare-source' | 'prepare-destination' | 'preflight' | 'migration' | 'cleanup' | null;
	findings: WordPressMigrationFinding[];
	source_url: string | null;
	started_at: string | null;
	completed_at: string | null;
	// Where the email announcing the finished migration is sent.
	notification_email: string | null;
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
