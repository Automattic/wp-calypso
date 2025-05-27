export type ThreatAction = 'fix' | 'ignore' | 'unignore';

export type Extension = {
	slug: string;
	version: string;
	type: 'plugin' | 'theme';
};

export type ThreatType = 'core' | 'file' | 'plugin' | 'theme' | 'database' | 'none' | string;

export type ThreatFixType = 'replace' | 'delete' | 'update' | string;

export type ThreatFix = {
	fixer: ThreatFixType;
	file?: string;
	target?: string;
};

export type ThreatStatus = 'fixed' | 'ignored' | 'current';

// @todo: make the history API response use a number for a threat ID instead of a string
export interface BaseThreat {
	id: number;
	signature: string;
	description: string;
	status: ThreatStatus;
	firstDetected: Date;
	fixedOn?: Date;
	fixable: false | ThreatFix;
	fixerStatus?: string;
	filename?: string;
	extension?: Extension;
	rows?: Record< string, unknown >;
	table?: string;
	primaryKeyColumn?: string;
	value?: string;
	diff?: string;
	context?: Record< string, unknown >;
	severity: number;
	source?: string;
	version?: string;
	details?: Record< string, unknown >;
}

export interface FixableThreat extends BaseThreat {
	fixable: ThreatFix;
}

export interface IgnorableThreat extends BaseThreat {
	fixable: false;
}

export type Threat = IgnorableThreat | FixableThreat;

export type ThreatPayload =
	| 'backdoor'
	| 'ccskimmers'
	| 'cryptominer'
	| 'dropper'
	| 'generic'
	| 'hacktool'
	| 'hardening'
	| 'malware'
	| 'malvertising'
	| 'phishing'
	| 'redirect'
	| 'seospam'
	| 'suspicious'
	| 'uploader'
	| 'webshell';

export type SignatureComponents = {
	signatureId: string | undefined;
	language: string;
	payload: ThreatPayload | string;
	family: string;
	variant: string;
};
