import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { __experimentalVStack as VStack, Button, FormFileUpload } from '@wordpress/components';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { domainQuery } from '../../app/queries/domain';
import { domainDnsQuery } from '../../app/queries/domain-dns-records';
import { domainRoute } from '../../app/routes/domain-routes';
import DataViewsCard from '../../components/dataviews-card';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { useDnsActions } from './actions';
import DnsActionsMenu from './dns-actions-menu';
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
		setIsRestoreDefaultARecordsDialogOpen( true );
	};

	const handleRestoreDefaultCnameRecord = () => {
		setIsRestoreDefaultCnameRecordDialogOpen( true );
	};

	const handleRestoreDefaultEmailRecords = () => {
		setIsRestoreDefaultEmailRecordsDialogOpen( true );
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
								<Button variant="primary">{ __( 'Add DNS Record' ) }</Button>
								<DnsActionsMenu
									hasDefaultARecords={ hasDefaultARecordsValue }
									hasDefaultCnameRecord={ hasDefaultCnameRecordValue }
									hasDefaultEmailRecords={ hasDefaultEmailRecordsValue }
									onRestoreDefaultARecords={ handleRestoreDefaultARecords }
									onRestoreDefaultCnameRecord={ handleRestoreDefaultCnameRecord }
									onRestoreDefaultEmailRecords={ handleRestoreDefaultEmailRecords }
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
						</>
					</DataViews>
				) }
			</DataViewsCard>
			<RestoreDefaultARecords
				onConfirm={ () => setIsRestoreDefaultARecordsDialogOpen( false ) }
				onCancel={ () => setIsRestoreDefaultARecordsDialogOpen( false ) }
				isBusy={ false }
				isGravatarDomain={ domain?.is_gravatar_domain ?? false }
				isOpen={ isRestoreDefaultARecordsDialogOpen }
			/>
			<RestoreDefaultCnameRecord
				onConfirm={ () => setIsRestoreDefaultCnameRecordDialogOpen( false ) }
				onCancel={ () => setIsRestoreDefaultCnameRecordDialogOpen( false ) }
				isBusy={ false }
				isOpen={ isRestoreDefaultCnameRecordDialogOpen }
			/>
			<RestoreDefaultEmailRecords
				onConfirm={ () => setIsRestoreDefaultEmailRecordsDialogOpen( false ) }
				onCancel={ () => setIsRestoreDefaultEmailRecordsDialogOpen( false ) }
				isBusy={ false }
				isOpen={ isRestoreDefaultEmailRecordsDialogOpen }
			/>
		</PageLayout>
	);
}
