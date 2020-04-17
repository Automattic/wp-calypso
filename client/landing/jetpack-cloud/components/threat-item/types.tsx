export type ThreatAction = 'fix' | 'ignore';

export type Extension = {
	slug: string;
	version: string;
	type: 'plugin' | 'theme';
};

export type ThreatType = 'core' | 'file' | 'plugin' | 'theme' | 'database' | 'none' | string;

export type Threat = {
	id: number;
	signature: string;
	description: string;
	action?: 'fixed' | 'ignored';
	detectionDate: string;
	actionDate: string;
	fixable?: boolean;
	filename?: string;
	extension?: Extension;
	rows?: number;
	diff?: string;
	context?: object;
};
