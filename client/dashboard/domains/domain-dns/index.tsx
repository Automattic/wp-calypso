import { useMutation, useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { __experimentalVStack as VStack, Button, FormFileUpload } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useState } from 'react';
import { domainQuery } from '../../app/queries/domain';
import {
	domainDnsMutation,
	domainDnsQuery,
	domainDnsEmailMutation,
} from '../../app/queries/domain-dns-records';
import { domainDnsAddRoute, domainRoute } from '../../app/router/domains';
import DataViewsCard from '../../components/dataviews-card';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { useDnsActions } from './actions';
import DnsActionsMenu from './dns-actions-menu';
import EmailSetup from './email-setup';
import { useDnsFields } from './fields';
import RestoreDefaultARecords from './restore-default-a-records';
import RestoreDefaultCnameRecord from './restore-default-cname-record';
import RestoreDefaultEmailRecords from './restore-default-email-records';
import { hasDefaultARecords, hasDefaultCnameRecord, hasDefaultEmailRecords } from './utils';
import type { DnsRecord } from '../../data/domain-dns-records';
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
	const updateDnsMutation = useMutation( domainDnsMutation( domainName ) );
	const restoreDefaultEmailRecordsMutation = useMutation( domainDnsEmailMutation( domainName ) );
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const { data: domain } = useSuspenseQuery( domainQuery( domainName ) );
	const { data: dnsData, isLoading } = useQuery( domainDnsQuery( domainName ) );
	const [ isRestoreDefaultARecordsDialogOpen, setIsRestoreDefaultARecordsDialogOpen ] =
		useState( false );
	const [ isRestoreDefaultCnameRecordDialogOpen, setIsRestoreDefaultCnameRecordDialogOpen ] =
		useState( false );
	const [ isRestoreDefaultEmailRecordsDialogOpen, setIsRestoreDefaultEmailRecordsDialogOpen ] =
		useState( false );

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

	const handleRestoreDefaultARecords = () => {
		const recordsToRemove = dnsData?.records?.filter(
			( record ) =>
				record.domain === record.name.replace( /\.$/, '' ) &&
				[ 'A', 'AAAA' ].includes( record.type )
		);

		updateDnsMutation.mutate(
			{
				recordsToRemove,
				restoreDefaultARecords: true,
			},
			{
				onSuccess: () => {
					createSuccessNotice( __( 'Default A records restored.' ), {
						type: 'snackbar',
					} );
				},
				onError: () => {
					createErrorNotice( __( 'Failed to restore the default A records.' ), {
						type: 'snackbar',
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
		updateDnsMutation.mutate(
			{
				recordsToRemove,
				recordsToAdd: recordsToAdd as DnsRecord[],
			},
			{
				onSuccess: () => {
					createSuccessNotice( __( 'Default CNAME record restored.' ), {
						type: 'snackbar',
					} );
				},
				onError: ( error ) => {
					if ( error.message.match( /^CNAME www\..+ conflicts with .*$/ ) ) {
						createErrorNotice(
							__(
								'Failed to restore the default CNAME record. Please remove any DNS records you added for the “www” subdomain before restoring the default CNAME record.'
							),
							{
								type: 'snackbar',
							}
						);
					} else {
						createErrorNotice( __( 'Failed to restore the default CNAME record.' ), {
							type: 'snackbar',
						} );
					}
				},
				onSettled: () => {
					setIsRestoreDefaultCnameRecordDialogOpen( false );
				},
			}
		);
	};

	const handleRestoreDefaultEmailRecords = () => {
		restoreDefaultEmailRecordsMutation.mutate( undefined, {
			onSuccess: () => {
				createSuccessNotice( __( 'The default email DNS records were successfully fixed!' ), {
					type: 'snackbar',
				} );
			},
			onError: () => {
				createErrorNotice( __( 'There was a problem when restoring default email DNS records' ), {
					type: 'snackbar',
				} );
			},
			onSettled: () => {
				setIsRestoreDefaultEmailRecordsDialogOpen( false );
			},
		} );
	};

	return (
		<PageLayout
			size="small"
			header={
				<VStack>
					<PageHeader
						title={ __( 'DNS Records' ) }
						actions={
							<>
								{ /* TODO Implement bind file logic */ }
								<FormFileUpload
									__next40pxDefaultSize
									onChange={ ( event ) => {
										const file = event.currentTarget.files?.[ 0 ];
										if ( ! file ) {
											return;
										}
										// const formData = [ [ 'files[]', file, file.name ] ];
									} }
								>
									{ /* <Button variant="secondary">{ __( 'Import BIND file' ) }</Button> */ }
								</FormFileUpload>
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
									{ __( 'Add DNS Record' ) }
								</Button>
								<DnsActionsMenu
									hasDefaultARecords={ hasDefaultARecordsValue }
									hasDefaultCnameRecord={ hasDefaultCnameRecordValue }
									hasDefaultEmailRecords={ hasDefaultEmailRecordsValue }
									onRestoreDefaultARecords={ () => setIsRestoreDefaultARecordsDialogOpen( true ) }
									onRestoreDefaultCnameRecord={ () =>
										setIsRestoreDefaultCnameRecordDialogOpen( true )
									}
									onRestoreDefaultEmailRecords={ () =>
										setIsRestoreDefaultEmailRecordsDialogOpen( true )
									}
								/>
							</>
						}
					/>
				</VStack>
			}
		>
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
				isGravatarDomain={ domain?.is_gravatar_domain ?? false }
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
		</PageLayout>
	);
}
