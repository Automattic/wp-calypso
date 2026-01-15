import {
	domainQuery,
	domainDnsMutation,
	domainDnsQuery,
	domainDnsEmailMutation,
} from '@automattic/api-queries';
import { useMutation, useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	Button,
} from '@wordpress/components';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import Breadcrumbs from '../../app/breadcrumbs';
import { domainDnsAddRoute, domainRoute } from '../../app/router/domains';
import { DataViewsCard } from '../../components/dataviews';
import InlineSupportLink from '../../components/inline-support-link';
import Notice from '../../components/notice';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { useDnsActions } from './actions';
import DnsActionsMenu from './dns-actions-menu';
import DnsDescription from './dns-description';
import DnsImportDialog from './dns-import-dialog';
import EmailSetup from './email-setup';
import { useDnsFields } from './fields';
import { DomainDnsNameserversNotice } from './notice';
import RestoreDefaultARecords from './restore-default-a-records';
import RestoreDefaultCnameRecord from './restore-default-cname-record';
import RestoreDefaultEmailRecords from './restore-default-email-records';
import { hasDefaultARecords, hasDefaultCnameRecord, hasDefaultEmailRecords } from './utils';
import type { DnsRecord } from '@automattic/api-core';
import type { ViewTable, ViewList, View } from '@wordpress/dataviews';

function getDnsRecordId( record: DnsRecord ) {
	return `${ record.id }-${ record.name }`;
}

type DnsView = ViewTable | ViewList;

const DEFAULT_VIEW: DnsView = {
	type: 'table',
	search: '',
	page: 1,
	perPage: 20,
	titleField: 'type',
	sort: {
		field: 'type',
		direction: 'asc',
	},
	fields: [ 'name', 'value' ],
	filters: [],
};

const DEFAULT_LAYOUTS = {
	table: {},
	list: {},
};

export default function DomainDns() {
	const { domainName } = domainRoute.useParams();
	const router = useRouter();
	const { recordTracksEvent } = useAnalytics();
	const updateDnsMutation = useMutation( {
		...domainDnsMutation( domainName ),
		meta: {
			snackbar: {
				/* translators: %s is the domain name */
				success: sprintf( __( 'Default A records restored for %s.' ), domainName ),
				error: { source: 'server' },
			},
		},
	} );
	const restoreDefaultEmailRecordsMutation = useMutation( {
		...domainDnsEmailMutation( domainName ),
		meta: {
			snackbar: {
				/* translators: %s is the domain name */
				success: sprintf( __( 'Default email DNS records restored for %s.' ), domainName ),
				error: { source: 'server' },
			},
		},
	} );

	const { data: domain } = useSuspenseQuery( domainQuery( domainName ) );
	const { data: dnsData, isLoading } = useQuery( domainDnsQuery( domainName ) );
	const [ isRestoreDefaultARecordsDialogOpen, setIsRestoreDefaultARecordsDialogOpen ] =
		useState( false );
	const [ isRestoreDefaultCnameRecordDialogOpen, setIsRestoreDefaultCnameRecordDialogOpen ] =
		useState( false );
	const [ isRestoreDefaultEmailRecordsDialogOpen, setIsRestoreDefaultEmailRecordsDialogOpen ] =
		useState( false );
	const [ isImportDialogOpen, setIsImportDialogOpen ] = useState( false );
	const [ importedRecords, setImportedRecords ] = useState< DnsRecord[] >( [] );

	const actions = useDnsActions();
	const fields = useDnsFields( domainName );
	const [ view, setView ] = useState< DnsView >( DEFAULT_VIEW );

	const hasDefaultARecordsValue = hasDefaultARecords( dnsData?.records ?? [] );
	const hasDefaultCnameRecordValue = hasDefaultCnameRecord( dnsData?.records ?? [], domainName );
	const hasDefaultEmailRecordsValue = hasDefaultEmailRecords( dnsData?.records ?? [], domainName );

	const { data: filteredData, paginationInfo } = filterSortAndPaginate(
		dnsData?.records ?? [],
		view,
		fields
	);

	const closeImportDialog = () => {
		setIsImportDialogOpen( false );
		setImportedRecords( [] );
	};

	const handleRestoreDefaultARecords = () => {
		const recordsToRemove = dnsData?.records?.filter(
			( record ) =>
				record.domain === record.name.replace( /\.$/, '' ) &&
				[ 'A', 'AAAA' ].includes( record.type )
		);

		recordTracksEvent( 'calypso_dashboard_domain_dns_restore_default_a_records', {
			domain: domainName,
		} );

		updateDnsMutation.mutate(
			{
				recordsToRemove,
				restoreDefaultARecords: true,
			},
			{
				onSuccess: () => {
					recordTracksEvent( 'calypso_dashboard_domain_dns_restore_default_a_records_success', {
						domain: domainName,
					} );
				},
				onError: ( error ) => {
					recordTracksEvent( 'calypso_dashboard_domain_dns_restore_default_a_records_failure', {
						domain: domainName,
						error_message: error.message,
					} );
				},
				onSettled: () => {
					setIsRestoreDefaultARecordsDialogOpen( false );
				},
			}
		);
	};

	const handleRestoreDefaultCnameRecord = () => {
		const recordsToRemove = dnsData?.records?.filter(
			( record ) =>
				record.domain !== record.name.replace( /\.$/, '' ) &&
				'CNAME' === record.type &&
				'www' === record.name
		);
		const recordsToAdd = [
			{
				type: 'CNAME',
				data: `${ domainName }.`,
				name: 'www',
			},
		];

		recordTracksEvent( 'calypso_dashboard_domain_dns_restore_default_cname_record', {
			domain: domainName,
		} );

		updateDnsMutation.mutate(
			{
				recordsToRemove,
				recordsToAdd: recordsToAdd as DnsRecord[],
			},
			{
				onSuccess: () => {
					recordTracksEvent( 'calypso_dashboard_domain_dns_restore_default_cname_record_success', {
						domain: domainName,
					} );
				},
				onError: ( error ) => {
					recordTracksEvent( 'calypso_dashboard_domain_dns_restore_default_cname_record_failure', {
						domain: domainName,
						error_message: error.message,
					} );
				},
				onSettled: () => {
					setIsRestoreDefaultCnameRecordDialogOpen( false );
				},
			}
		);
	};

	const handleRestoreDefaultEmailRecords = () => {
		recordTracksEvent( 'calypso_dashboard_domain_dns_restore_default_email_records', {
			domain: domainName,
		} );

		restoreDefaultEmailRecordsMutation.mutate( undefined, {
			onSuccess: () => {
				recordTracksEvent( 'calypso_dashboard_domain_dns_restore_default_email_records_success', {
					domain: domainName,
				} );
			},
			onError: ( error ) => {
				recordTracksEvent( 'calypso_dashboard_domain_dns_restore_default_email_records_failure', {
					domain: domainName,
					error_message: error.message,
				} );
			},
			onSettled: () => {
				setIsRestoreDefaultEmailRecordsDialogOpen( false );
			},
		} );
	};

	const renderDefaultARecordsNotice = () => {
		if ( ! domain.has_wpcom_nameservers || hasDefaultARecordsValue ) {
			return null;
		}

		if ( domain.is_gravatar_domain ) {
			return (
				<Notice variant="warning" title={ __( 'Your domain is not using default A records' ) }>
					{ createInterpolateElement(
						__(
							'This means it may not be pointing to your Gravatar profile correctly. To restore default A records, click on the three dots menu and select “Restore default A records”. <learnMoreLink />'
						),
						{
							learnMoreLink: <InlineSupportLink supportContext="dns_default_records" />,
						}
					) }
				</Notice>
			);
		}
		return (
			<Notice variant="warning" title={ __( 'Your domain is not using default A records' ) }>
				{ createInterpolateElement(
					__(
						'This means it may not be pointing to your WordPress.com site correctly. To restore default A records, click on the three dots menu and select “Restore default A records”. <learnMoreLink />'
					),
					{
						learnMoreLink: <InlineSupportLink supportContext="dns_default_records" />,
					}
				) }
			</Notice>
		);
	};

	const renderDefaultCnameRecordNotice = () => {
		if ( ! domain.has_wpcom_nameservers || hasDefaultCnameRecordValue ) {
			return null;
		}

		return (
			<Notice
				variant="warning"
				title={ __( 'Your domain is not using the default WWW CNAME record' ) }
			>
				{ createInterpolateElement(
					__(
						'This means your WordPress.com site may not be reached correctly using the www prefix. To restore the default WWW CNAME record, click on the three dots menu and select “Restore default CNAME record”. <learnMoreLink />'
					),
					{
						learnMoreLink: <InlineSupportLink supportContext="dns_default_records" />,
					}
				) }
			</Notice>
		);
	};

	const renderDnsRecordsExplanationNotice = () => {
		return (
			<Notice title={ __( 'What are DNS records used for?' ) }>
				{ createInterpolateElement(
					__(
						'Custom DNS records allow you to connect your domain to third-party services that are not hosted on WordPress.com, such as an email provider. <learnMoreLink />'
					),
					{
						learnMoreLink: <InlineSupportLink supportContext="manage-your-dns-records" />,
					}
				) }
			</Notice>
		);
	};

	return (
		<PageLayout
			size="small"
			header={
				<VStack>
					<PageHeader
						prefix={ <Breadcrumbs length={ 2 } /> }
						actions={
							<HStack>
								<Button
									variant="primary"
									onClick={ () => {
										router.navigate( {
											to: domainDnsAddRoute.fullPath,
											params: { domainName },
										} );
									} }
									__next40pxDefaultSize
								>
									{ __( 'Add record' ) }
								</Button>
								<PageHeader.ActionMenu>
									<DnsActionsMenu
										domainName={ domainName }
										hasDefaultARecords={ hasDefaultARecordsValue }
										hasDefaultCnameRecord={ hasDefaultCnameRecordValue }
										hasDefaultEmailRecords={ hasDefaultEmailRecordsValue }
										onRecordsImported={ ( data ) => {
											setImportedRecords( data );
											setIsImportDialogOpen( true );
										} }
										onRestoreDefaultARecords={ () => setIsRestoreDefaultARecordsDialogOpen( true ) }
										onRestoreDefaultCnameRecord={ () =>
											setIsRestoreDefaultCnameRecordDialogOpen( true )
										}
										onRestoreDefaultEmailRecords={ () =>
											setIsRestoreDefaultEmailRecordsDialogOpen( true )
										}
									/>
								</PageHeader.ActionMenu>
							</HStack>
						}
						description={ <DnsDescription /> }
					/>
				</VStack>
			}
		>
			{ renderDnsRecordsExplanationNotice() }
			<DomainDnsNameserversNotice domainName={ domainName } domain={ domain } />
			{ renderDefaultARecordsNotice() }
			{ renderDefaultCnameRecordNotice() }
			<DataViewsCard>
				{ dnsData?.records?.length === 0 && ! isLoading ? (
					<div style={ { padding: '20px', textAlign: 'center' } }>
						{ __( 'No DNS records found for this domain.' ) }
					</div>
				) : (
					<DataViews< DnsRecord >
						data={ filteredData || [] }
						fields={ fields }
						onChangeView={ ( view: View ) => setView( view as DnsView ) }
						search={ false }
						view={ view }
						actions={ actions }
						paginationInfo={ paginationInfo }
						getItemId={ getDnsRecordId }
						isLoading={ isLoading }
						defaultLayouts={ DEFAULT_LAYOUTS }
					>
						<>
							<DataViews.Layout />
							<DataViews.Pagination />
						</>
					</DataViews>
				) }
			</DataViewsCard>
			<EmailSetup />
			<RestoreDefaultARecords
				onConfirm={ handleRestoreDefaultARecords }
				onCancel={ () => setIsRestoreDefaultARecordsDialogOpen( false ) }
				isBusy={ updateDnsMutation.isPending }
				isGravatarDomain={ domain.is_gravatar_domain ?? false }
				isOpen={ isRestoreDefaultARecordsDialogOpen }
			/>
			<RestoreDefaultCnameRecord
				onConfirm={ handleRestoreDefaultCnameRecord }
				onCancel={ () => setIsRestoreDefaultCnameRecordDialogOpen( false ) }
				isBusy={ updateDnsMutation.isPending }
				isOpen={ isRestoreDefaultCnameRecordDialogOpen }
			/>
			<RestoreDefaultEmailRecords
				onConfirm={ handleRestoreDefaultEmailRecords }
				onCancel={ () => setIsRestoreDefaultEmailRecordsDialogOpen( false ) }
				isBusy={ updateDnsMutation.isPending }
				isOpen={ isRestoreDefaultEmailRecordsDialogOpen }
			/>
			{ isImportDialogOpen && (
				<DnsImportDialog
					isOpen={ isImportDialogOpen }
					domainName={ domainName }
					records={ importedRecords }
					onConfirm={ closeImportDialog }
					onCancel={ closeImportDialog }
				/>
			) }
		</PageLayout>
	);
}
