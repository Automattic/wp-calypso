import { Button } from '@automattic/components';
import { sprintf } from '@wordpress/i18n';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import Accordion from 'calypso/components/domains/accordion';
import useDomainDiagnosticsQuery from 'calypso/data/domains/diagnostics/use-domain-diagnostics-query';
import wpcom from 'calypso/lib/wp';
import type { ResponseDomain } from 'calypso/lib/domains/types';

import './style.scss';

export default function DomainDiagnosticsCard( { domain }: { domain: ResponseDomain } ) {
	const translate = useTranslate();
	const {
		data,
		isFetching,
		refetch: refetchDomainDiagnostics,
	} = useDomainDiagnosticsQuery( domain.name );
	const [ isRestoringDefaultRecords, setIsRestoringDefaultRecords ] = useState( false );

	if ( ! domain.isMappedToAtomicSite ) {
		return null;
	}
	if ( isFetching ) {
		return null;
	}
	if ( ! data ) {
		return null;
	}

	const recordsToCheck = [ 'spf', 'dkim1', 'dkim2', 'dmarc' ];
	const emailDnsDiagnostics = data.email_dns_records;

	if ( emailDnsDiagnostics.all_essential_email_dns_records_are_correct ) {
		return null;
	}

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
		setIsRestoringDefaultRecords( true );

		wpcom.req
			.post( {
				apiNamespace: 'wpcom/v2',
				path: `/domains/dns/restore-default-email-records/${ domain.name }`,
			} )
			.catch( ( error: Error ) => {
				throw error;
			} )
			.then( () => {
				refetchDomainDiagnostics();
			} )
			.finally( () => {
				setIsRestoringDefaultRecords( false );
			} );
	};

	const renderFixButton = () => {
		return (
			<Button busy={ isRestoringDefaultRecords } onClick={ fixDnsIssues } primary>
				{ translate( 'Fix DNS issues automatically' ) }
			</Button>
		);
	};

	return (
		<Accordion
			className="domain-diagnostics-card__accordion"
			title={ translate( 'Diagnostics', { textOnly: true } ) }
			subtitle={ translate( 'There are some issues with your domain', { textOnly: true } ) }
			key="diagnostics"
		>
			<div>
				<p>{ translate( "There are some issues with your domain's DNS settings:" ) }</p>
				<ul>{ recordsToCheck.map( ( record ) => renderDiagnosticForRecord( record ) ) }</ul>
				{ ! emailDnsDiagnostics.is_using_wpcom_name_servers && renderFixInstructions() }
				{ emailDnsDiagnostics.is_using_wpcom_name_servers && renderFixButton() }
			</div>
		</Accordion>
	);
}
