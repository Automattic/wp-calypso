export interface BackupKnownThreats {
	malware: number;
	database: number;
	vulnerable: number;
	ignored: number;
	flagged: number;
	fixed: number;
}

export interface BackupThreat {
	id: number | string;
	state: 'open' | 'fixed';
	kind: 'malware' | 'database' | 'vulnerable';
	signature: string | null;
	path_kind: string;
	type: string;
	target: string;
	path?: string;
	slug?: string;
	version?: string;
	status: 'new' | 'notified' | 'ignored' | null;
	reported_on: string | null;
	fixed_on: string | null;
}

export interface BackupThreats {
	backup_id: number;
	cutoff: string | null;
	summary: BackupKnownThreats;
	threats: BackupThreat[];
	count: number;
	truncated: boolean;
}

export interface BackupsKnownThreatsPage {
	byPeriod: Record< number, BackupKnownThreats >;
	periods: number[];
	latestWithoutKnownThreats: number | null;
	oldestPeriod: number | null;
	totalPages: number;
}

export interface BackupsKnownThreatsResponse {
	totalPages?: number;
	latest_without_known_threats?: number | null;
	backups?: Array< {
		object?: {
			backup_period?: string | number;
			known_threats?: BackupKnownThreats;
		};
	} >;
}
