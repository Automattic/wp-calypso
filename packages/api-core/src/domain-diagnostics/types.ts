export type DomainDiagnostics = {
	email_dns_records: {
		code?: string;
		records: {
			[ dnsRecordType: string ]: {
				status: string;
				correct_record: string;
				error_message?: string;
			};
		};
		is_using_wpcom_name_servers: boolean;
		all_essential_email_dns_records_are_correct: boolean;
		dismissed_email_dns_issues_notice: boolean;
		should_offer_automatic_fixes: boolean;
	};
};
