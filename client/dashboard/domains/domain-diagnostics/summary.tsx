import { __ } from '@wordpress/i18n';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import type { Domain, DomainDiagnostics } from '@automattic/api-core';

export default function DomainDiagnosticsSettingsSummary( {
	domain,
	domainDiagnostics,
}: {
	domain: Domain;
	domainDiagnostics: DomainDiagnostics;
} ) {
	let badges = [];
	const emailDnsDiagnostics = domainDiagnostics.email_dns_records;

	if (
		! emailDnsDiagnostics ||
		emailDnsDiagnostics.code === 'domain_not_mapped_to_atomic_site' ||
		emailDnsDiagnostics.all_essential_email_dns_records_are_correct
	) {
		return null;
	}

	badges = [
		{
			text: __( 'Issues with DNS email records' ),
			intent: domainDiagnostics.email_dns_records.dismissed_email_dns_issues_notice
				? undefined
				: ( 'error' as const ),
		},
	];

	return (
		<RouterLinkSummaryButton
			to={ `/domains/${ domain.domain }/diagnostics` }
			title={ __( 'Diagnostics' ) }
			badges={ badges }
			density={ 'medium' as const }
		/>
	);
}
