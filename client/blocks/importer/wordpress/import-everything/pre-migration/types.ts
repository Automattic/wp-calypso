export interface StartImportTrackingProps {
	type?: string;
	[ key: string ]: unknown;
}

export type CredentialsStatus = 'unsubmitted' | 'pending' | 'success' | 'failed';

export type CredentialsProtocol = 'ftp' | 'ssh';

export type PreMigrationState =
	| 'loading'
	| 'not-authorized'
	| 'credentials'
	| 'upgrade-plan'
	| 'update-plugin'
	| 'ready';
