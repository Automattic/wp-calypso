import { Button } from '@automattic/components';
import { sprintf } from '@wordpress/i18n';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import Accordion from 'calypso/components/domains/accordion';
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import useDomainDiagnosticsQuery from 'calypso/data/domains/diagnostics/use-domain-diagnostics-query';
import { setDomainNotice } from 'calypso/lib/domains/set-domain-notice';
import wpcom from 'calypso/lib/wp';
import { useDispatch } from 'calypso/state';
import { fetchDns } from 'calypso/state/domains/dns/actions';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import DismissEmailDnsIssuesDialog from './dismiss-email-dns-issues-dialog';
import type { ResponseDomain } from 'calypso/lib/domains/types';

import './style.scss';

const noticeOptions = {
	duration: 5000,
	id: `domain-diagnostics-notification`,
};

export default function DomainDiagnosticsCard( { domain }: { domain: ResponseDomain } ) {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const {
		data,
		isFetching,
		refetch: refetchDomainDiagnostics,
	} = useDomainDiagnosticsQuery( domain.name );
	const [ isRestoringDefaultRecords, setIsRestoringDefaultRecords ] = useState( false );
	const [ isDismissEmailDnsIssuesDialogVisible, setIsDismissEmailDnsIssuesDialogVisible ] =
		useState( false );

	if ( ! domain.isMappedToAtomicSite || isFetching || ! data ) {
		return null;
	}

	const recordsToCheck = [ 'spf', 'dkim1', 'dkim2', 'dmarc' ];
	const emailDnsDiagnostics = data.email_dns_records;

	if (
		! emailDnsDiagnostics ||
		emailDnsDiagnostics.code === 'domain_not_mapped_to_atomic_site' ||
		emailDnsDiagnostics.all_essential_email_dns_records_are_correct
	) {
		return null;
	}

	const isEmailDnsIssuesNoticeDismissed = ! emailDnsDiagnostics.dismissed_email_dns_issues_notice;

	const dismissNotice = ( ignore: boolean ) => {
		if ( ignore ) {
			setDomainNotice( domain.name, 'email-dns-records-diagnostics', 'ignored', () => {
				refetchDomainDiagnostics();
			} );
		}
		setIsDismissEmailDnsIssuesDialogVisible( false );
	};

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
				path: `/dns/email/set-default-records`,
				body: {
					domain: domain.name,
				},
			} )
			.then( () => {
				dispatch(
					successNotice(
						translate( 'The default email DNS records were successfully fixed!' ),
						noticeOptions
					)
				);
				// Fetch DNS records to update the DNS records section's UI
				dispatch( fetchDns( domain.name, true ) );
				refetchDomainDiagnostics();
			} )
			.catch( () => {
				dispatch(
					errorNotice(
						translate( 'There was a problem when restoring default email DNS records' ),
						noticeOptions
					)
				);
			} )
			.finally( () => {
				setIsRestoringDefaultRecords( false );
			} );
	};

	const renderFixButton = () => {
		return (
			<Button
				busy={ isRestoringDefaultRecords }
				disabled={ isRestoringDefaultRecords }
				onClick={ fixDnsIssues }
				primary
			>
				{ translate( 'Fix DNS issues automatically' ) }
			</Button>
		);
	};

	const noticeText =
		'If you use this domain name to send email from your WordPress.com website, the following email records are required.';
	// TODO: Add the corresponding support doc link when it's published
	// const supportLink = '';
	// const noticeText = translate(
	// 	'If you use this domain name to send email from your WordPress.com website, the following email records are required. {{a}}Learn more{{/a}}.',
	// 	{
	// 		components: {
	// 			a: <a href={ localizeUrl( supportLink ) } />,
	// 		},
	// 	}
	// );

	return (
		<>
			<DismissEmailDnsIssuesDialog
				onClose={ dismissNotice }
				isVisible={ isDismissEmailDnsIssuesDialogVisible }
			/>

			<Accordion
				className="domain-diagnostics-card__accordion"
				title={ translate( 'Diagnostics', { textOnly: true } ) }
				subtitle={ translate( 'There are some issues with your domain', { textOnly: true } ) }
				key="diagnostics"
				expanded={ isEmailDnsIssuesNoticeDismissed }
			>
				<div>
					<Notice status="is-warning" text={ noticeText } showDismiss={ false }>
						{ isEmailDnsIssuesNoticeDismissed && (
							<NoticeAction onClick={ () => setIsDismissEmailDnsIssuesDialogVisible( true ) }>
								Dismiss
							</NoticeAction>
						) }
					</Notice>
					<ul>{ recordsToCheck.map( renderDiagnosticForRecord ) }</ul>
					{ emailDnsDiagnostics.is_using_wpcom_name_servers
						? renderFixButton()
						: renderFixInstructions() }
				</div>
			</Accordion>
		</>
	);
}
