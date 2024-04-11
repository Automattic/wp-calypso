import { Button } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { SET_UP_EMAIL_AUTHENTICATION_FOR_YOUR_DOMAIN } from '@automattic/urls';
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
	} = useDomainDiagnosticsQuery( domain.name, {
		enabled: domain.isPrimary && domain.isMappedToAtomicSite,
	} );
	const [ isRestoringDefaultRecords, setIsRestoringDefaultRecords ] = useState( false );
	const [ isDismissEmailDnsIssuesDialogVisible, setIsDismissEmailDnsIssuesDialogVisible ] =
		useState( false );

	if ( ! domain.isPrimary || ! domain.isMappedToAtomicSite || isFetching || ! data ) {
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

	const renderDiagnosticForRecordType = (
		type: string,
		status: string,
		message: string,
		correct_record: string | null
	) => {
		return (
			<li key={ type }>
				{ message }
				{ correct_record ? (
					<p>
						<code>{ correct_record }</code>
					</p>
				) : null }
			</li>
		);
	};

	const renderDiagnosticForRecord = ( recordType: string ) => {
		const uppercaseRecord = recordType.toUpperCase();
		const records = emailDnsDiagnostics.records;
		let message: string | null = null;

		if ( records[ recordType ].error_message ) {
			message = records[ recordType ].error_message ?? null;
		} else if ( records[ recordType ].status === 'incorrect' ) {
			message = sprintf(
				/* translators: dnsRecordType is a DNS record type, e.g. SPF, DKIM or DMARC */
				translate( 'Your %(dnsRecordType)s record is incorrect. The correct record should be:' ),
				{
					dnsRecordType: uppercaseRecord,
				}
			);
		} else if ( records[ recordType ].status === 'not_found' ) {
			message = sprintf(
				/* translators: dnsRecordType is a DNS record type, e.g. SPF, DKIM or DMARC */
				translate( 'There is no %(dnsRecordType)s record. The correct record should be:' ),
				{
					dnsRecordType: uppercaseRecord,
				}
			);
		}

		if ( message ) {
			return renderDiagnosticForRecordType(
				recordType,
				records[ recordType ].status,
				message,
				records[ recordType ].correct_record ?? null
			);
		}

		return null;
	};

	const fixDnsIssues = () => {
		setIsRestoringDefaultRecords( true );

		wpcom.req
			.post( {
				apiNamespace: 'wpcom/v2',
				path: '/domains/dns/email/set-default-records',
				body: {
					domain: domain.name,
				},
			} )
			.then( () => {
				dispatch(
					successNotice(
						translate( 'The default email DNS records were successfully restored!' ),
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

	const noticeText = translate(
		'If you use this domain name to send email from your WordPress.com website, the following email records are required. {{a}}Learn more{{/a}}.',
		{
			components: {
				a: <a href={ localizeUrl( SET_UP_EMAIL_AUTHENTICATION_FOR_YOUR_DOMAIN ) } />,
			},
		}
	);

	const renderFixInstructions = () => {
		if ( ! emailDnsDiagnostics.is_using_wpcom_name_servers ) {
			return (
				<p>
					{ translate(
						"To fix these issues, you should go to your domain's DNS provider and add the records above to your domain's DNS settings."
					) }
				</p>
			);
		}

		if ( emailDnsDiagnostics.should_offer_automatic_fixes ) {
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
		}
	};

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
					{ renderFixInstructions() }
				</div>
			</Accordion>
		</>
	);
}
