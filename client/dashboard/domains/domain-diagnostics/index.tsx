import {
	domainDnsEmailMutation,
	domainDiagnosticsQuery,
	domainNoticeMutation,
} from '@automattic/api-queries';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Button, __experimentalVStack as VStack } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import Breadcrumbs from '../../app/breadcrumbs';
import { domainOverviewRoute, domainRoute } from '../../app/router/domains';
import { ButtonStack } from '../../components/button-stack';
import InlineSupportLink from '../../components/inline-support-link';
import Notice from '../../components/notice';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { Text } from '../../components/text';

export default function DomainDiagnostics() {
	const { domainName } = domainRoute.useParams();
	const navigate = useNavigate();

	const { data: domainDiagnostics } = useSuspenseQuery( domainDiagnosticsQuery( domainName ) );

	const { mutate: fixDnsIssues, isPending: isFixing } = useMutation( {
		...domainDnsEmailMutation( domainName ),
		meta: {
			snackbar: {
				success: __( 'Default email DNS records restored.' ),
				error: { source: 'server' },
			},
		},
	} );

	const { mutate: dismissNotice, isPending: isDismissing } = useMutation( {
		...domainNoticeMutation( domainName, 'email-dns-records-diagnostics' ),
		meta: {
			snackbar: {
				success: __( 'Domain diagnostics notice dismissed.' ),
				error: { source: 'server' },
			},
		},
	} );

	const emailDnsDiagnostics = domainDiagnostics?.email_dns_records;

	const renderDiagnosticForRecord = ( recordType: string ) => {
		const uppercaseRecord = recordType.toUpperCase();
		const record = emailDnsDiagnostics.records[ recordType ];

		if ( ! record ) {
			return null;
		}

		let message: string | null = null;

		if ( record.error_message ) {
			message = record.error_message;
		} else if ( record.status === 'incorrect' ) {
			message = sprintf(
				/* translators: dnsRecordType is a DNS record type, e.g. SPF, DKIM or DMARC */
				__( 'Your %(dnsRecordType)s record is incorrect. The correct record should be:' ),
				{
					dnsRecordType: uppercaseRecord,
				}
			);
		} else if ( record.status === 'not_found' ) {
			message = sprintf(
				/* translators: dnsRecordType is a DNS record type, e.g. SPF, DKIM or DMARC */
				__( 'There is no %(dnsRecordType)s record. The correct record should be:' ),
				{
					dnsRecordType: uppercaseRecord,
				}
			);
		}

		if ( ! message ) {
			return null;
		}

		return (
			<li key={ recordType }>
				<Text>{ message }</Text>
				{ record.correct_record && (
					<pre>
						<code>{ record.correct_record }</code>
					</pre>
				) }
			</li>
		);
	};

	const renderNotices = () => {
		const emailDnsDiagnostics = domainDiagnostics?.email_dns_records;

		if (
			! emailDnsDiagnostics ||
			emailDnsDiagnostics.code === 'domain_not_mapped_to_atomic_site' ||
			emailDnsDiagnostics.all_essential_email_dns_records_are_correct
		) {
			return (
				<Notice
					variant="success"
					title={ __( 'We didn’t find any issues with your domain!' ) }
				></Notice>
			);
		}

		return (
			<Notice variant="error" title={ __( 'Missing or invalid DNS records' ) }>
				<Text>
					{ createInterpolateElement(
						__(
							'If you use this domain name to send email from your WordPress.com website, the following email records are required. <LearnMoreLink />'
						),
						{
							LearnMoreLink: <InlineSupportLink supportContext="domain-email-authentication" />,
						}
					) }
				</Text>
			</Notice>
		);
	};

	const renderDiagnostics = () => {
		const emailDnsDiagnostics = domainDiagnostics?.email_dns_records;

		const recordsToCheck = [ 'spf', 'dkim1', 'dkim2', 'dmarc' ];

		return (
			<VStack>
				<VStack as="ul" spacing={ 2 }>
					{ recordsToCheck.map( renderDiagnosticForRecord ) }
				</VStack>

				{ ! emailDnsDiagnostics.is_using_wpcom_name_servers && (
					<Notice variant="warning" title={ __( 'Missing or invalid DNS records' ) }>
						<Text>
							{ __(
								'To fix these issues, you should go to your domain’s DNS provider and add the records above to your domain’s DNS settings.'
							) }
						</Text>
					</Notice>
				) }

				<ButtonStack justify="start">
					{ emailDnsDiagnostics.should_offer_automatic_fixes && (
						<Button
							variant="primary"
							onClick={ () =>
								fixDnsIssues( undefined, {
									onSuccess: () => {
										navigate( { to: domainOverviewRoute.fullPath, params: { domainName } } );
									},
								} )
							}
							isBusy={ isFixing }
							disabled={ isFixing }
							__next40pxDefaultSize
						>
							{ __( 'Fix DNS issues automatically' ) }
						</Button>
					) }
					{ ! emailDnsDiagnostics.dismissed_email_dns_issues_notice && (
						<Button
							variant="secondary"
							onClick={ () =>
								dismissNotice( 'ignored', {
									onSuccess: () => {
										navigate( { to: domainOverviewRoute.fullPath, params: { domainName } } );
									},
								} )
							}
							isBusy={ isDismissing }
							disabled={ isDismissing }
							__next40pxDefaultSize
						>
							{ __( 'Dismiss this notice' ) }
						</Button>
					) }
				</ButtonStack>
			</VStack>
		);
	};

	return (
		<PageLayout
			size="small"
			notices={ renderNotices() }
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 2 } /> }
					description={ __( 'Detect domain configuration issues and fix them.' ) }
				/>
			}
		>
			{ renderDiagnostics() }
		</PageLayout>
	);
}
