interface Navigator {
	deviceMemory: number;
}

interface Window {
	COMMIT_SHA: string;
}

declare module 'wpcom-xhr-request';

type ReportData = Map< string, number | string | boolean >;

interface Report {
	data: ReportData;
	start: number;
	end?: number;
	toJSON: () => object;
}

type Collector = ( report: Report ) => Promise< Report > | Report;
