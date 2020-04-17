export type ThreatAction = 'fix' | 'ignore';

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
};

export type Threat = {
	id: number;
	signature: string;
	description: string;
	action?: 'fixed' | 'ignored';
	detectionDate: string;
	actionDate: string;
	fixable: false | ThreatFix;
	filename?: string;
	extension?: Extension;
	rows?: number;
	diff?: string;
	context?: object;
};
