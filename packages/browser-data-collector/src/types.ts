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
