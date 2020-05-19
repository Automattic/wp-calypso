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
	toJSON: () => object;
}

type Collector = ( report: Report ) => Promise< Report > | Report;
