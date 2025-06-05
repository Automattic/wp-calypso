export interface Report {
	id: string;
	site: string;
	status: 'sent' | 'error';
	createdAt: string;
}

export interface SiteReports {
	site: string;
	reports: Report[];
	totalReports: number;
	latestReport: Report;
}

export interface ReportsApiResponse {
	data: Report;
	status: 'sent' | 'error';
}
