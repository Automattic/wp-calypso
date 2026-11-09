export type WordPressMigrationFinding = {
	code: string;
	severity: 'warning' | 'failure';
	// How the finding will be resolved: user accepts it (continue), retry, or an assisted handoff.
	resolution: 'accept' | 'retry' | 'assisted_handoff';
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
