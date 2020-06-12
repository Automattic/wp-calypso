interface Navigator {
	deviceMemory: number;
	connection: {
		effectiveType: EffectiveConnectionType;
	};
}

declare enum EffectiveConnectionType {
	'2g',
	'3g',
	'4g',
	'slow-2g',
}

interface Window {
	COMMIT_SHA: string;
	BUILD_TARGET: string;
	configData: {
		env_id: string;
	};
}

declare module 'wpcom-xhr-request';

declare type ReportData = Map< string, number | string | boolean >;

interface Report {
	id: string;
	data: ReportData;
	beginning: number;
	end?: number;
}

declare type Collector = ( report: Report ) => Promise< Report > | Report;
