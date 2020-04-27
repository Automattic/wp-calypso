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
	filename?: string;
	extension?: Extension;
	rows?: number;
	diff?: string;
	context?: object;
}

export interface FixableThreat extends BaseThreat {
	fixable: ThreatFix;
}

export interface IgnorableThreat extends BaseThreat {
	fixable: false;
}

export type Threat = IgnorableThreat | FixableThreat;
