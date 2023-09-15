export interface DomainAnalyzerQueryResponse {
	domain: string;
	hosting_provider: {
		name: string;
	};
	whois: any;
	dns: any;
}
