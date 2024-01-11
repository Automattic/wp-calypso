import { Button } from '@automattic/components';
import { sprintf } from '@wordpress/i18n';
import { useTranslate } from 'i18n-calypso';
import type { DomainDiagnostics } from 'calypso/lib/domains/types';

import './style.scss';

export default function DomainDiagnosticsCard( {
	diagnostics,
}: {
	diagnostics: DomainDiagnostics;
} ) {
	const translate = useTranslate();
	const emailDnsDiagnostics = diagnostics.email_dns_records;
	const recordsToCheck = [ 'spf', 'dkim1', 'dkim2', 'dmarc' ];

	const renderDiagnosticForRecord = ( record: string ) => {
		const uppercaseRecord = record.toUpperCase();
		const records = emailDnsDiagnostics.records;

		if ( records[ record ].status === 'incorrect' ) {
			return (
				<li key={ record }>
					{ sprintf(
						/* translators: dnsRecordType is a DNS record type, e.g. SPF, DKIM or DMARC */
						translate(
							'Your %(dnsRecordType)s record is incorrect. The correct record should be:'
						),
						{
							dnsRecordType: uppercaseRecord,
						}
					) }
					<p>
						<code>{ records[ record ].correct_record }</code>
					</p>
				</li>
			);
		} else if ( records[ record ].status === 'not_found' ) {
			return (
				<li key={ record }>
					{ sprintf(
						/* translators: dnsRecordType is a DNS record type, e.g. SPF, DKIM or DMARC */
						translate( 'There is no %(dnsRecordType)s record. The correct record should be:' ),
						{
							dnsRecordType: uppercaseRecord,
						}
					) }
					<p>
						<code>{ records[ record ].correct_record }</code>
					</p>
				</li>
			);
		}

		return null;
	};

	const renderFixInstructions = () => {
		return (
			<p>
				{ translate(
					"To fix these issues, you should go to your domain's DNS provider and add the records above to your domain's DNS settings."
				) }
			</p>
		);
	};

	const fixDnsIssues = () => {
		// TODO: Implement
		return;
	};

	const renderFixButton = () => {
		return (
			<Button onClick={ fixDnsIssues } primary>
				{ translate( 'Fix DNS issues automatically' ) }
			</Button>
		);
	};

	return (
		<div>
			<p>{ translate( "There are some issues with your domain's DNS settings:" ) }</p>
			<ul>{ recordsToCheck.map( ( record ) => renderDiagnosticForRecord( record ) ) }</ul>
			{ ! emailDnsDiagnostics.is_using_wpcom_name_servers && renderFixInstructions() }
			{ emailDnsDiagnostics.is_using_wpcom_name_servers && renderFixButton() }
		</div>
	);
}
