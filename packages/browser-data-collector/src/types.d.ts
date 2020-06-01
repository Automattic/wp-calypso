interface Navigator {
	deviceMemory: number;
}

interface Window {
	COMMIT_SHA: string;
	BUILD_TARGET: string;
	configData: {
		env_id: string;
	};
}

declare module 'wpcom-xhr-request';

type ReportData = Map< string, number | string | boolean >;

interface Report {
	id: string;
	data: ReportData;
	start: number;
	end?: number;
	toJSON: () => object;
}

type Collector = ( report: Report ) => Promise< Report > | Report;
