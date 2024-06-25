export type Navigator = typeof navigator & {
	deviceMemory: number;
	connection: {
		effectiveType: EffectiveConnectionType;
	};
};

export enum EffectiveConnectionType {
	'2g',
	'3g',
	'4g',
	'slow-2g',
}

export type Window = typeof window & {
	COMMIT_SHA: string;
	BUILD_TARGET: string;
	configData: {
		env_id: string;
	};
};

export type ReportData = Map< string, number | string | boolean >;

export type ReportPayload = Record< string, number | string | boolean >;

export interface Report {
	id: string;
	data: ReportData;
	beginning: number;
	end?: number;
	stop: ( collector: Collector[] ) => Promise< ReportPayload >;
}

export type Collector = ( report: Report ) => Promise< Report > | Report;
