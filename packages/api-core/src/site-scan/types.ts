export interface ThreatFixer {
	fixer: 'update' | 'delete';
	target?: string;
	file?: string;
	extensionStatus?: 'active' | 'inactive';
	extras?: {
		is_dotorg?: boolean;
		is_bulk_fixable?: boolean;
	};
}

export interface ThreatExtension {
	type: 'plugin' | 'theme';
	slug: string;
	name: string;
	version: string;
	isPremium: boolean;
}

export interface Threat {
	id: number;
	signature: string;
	title: string;
	description: string;
	vulnerability_description?: string;
	fix_description?: string;
	payload_subtitle?: string | null;
	payload_description?: string | null;
	first_detected: string;
	severity: number;
	fixer?: ThreatFixer | null;
	status: 'current' | 'fixed' | 'ignored';
	fixable?: ThreatFixer | boolean;
	extension?: ThreatExtension;
	source?: string;
	filename?: string;
	context?: Record< string, string | Record< string, unknown > >;
	version?: string;
	table?: string;
	rows?: Record< string, unknown >;
	pk_column?: string;
	value?: string;
	details?: Record< string, unknown >;
	diff?: unknown;
}

export interface SiteScan {
	state: 'unavailable' | 'idle' | 'scanning' | 'provisioning';
	threats: Threat[];
	has_cloud: boolean;
	most_recent: {
		is_initial: boolean;
		timestamp: string;
		duration: number;
		progress: number;
		error: boolean;
	};
	reason?: string;
}
