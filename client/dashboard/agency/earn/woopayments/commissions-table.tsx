import {
	__experimentalHStack as HStack,
	__experimentalText as Text,
	Modal,
	Spinner,
} from '@wordpress/components';
import { DataViews as WPDataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { download, external } from '@wordpress/icons';
import { useCallback, useMemo, useState } from 'react';
import { DataViews } from '../../../components/dataviews';
import { TextSkeleton } from '../../../components/text-skeleton';
import { getSiteData } from './lib/site-data';
import {
	SiteColumn,
	TransactionsColumn,
	CommissionsPaidColumn,
	TimeframeCommissionsColumn,
	WooPaymentsStatusColumn,
	CommissionEligibilityColumn,
} from './site-columns';
import type { RecordTracksEvent, SitesWithWooPaymentsState } from './types';
import type { WooPaymentsData } from '@automattic/api-core';
import type { Field, View } from '@wordpress/dataviews';

interface CommissionsTableProps {
	sites: SitesWithWooPaymentsState[];
	woopaymentsData?: WooPaymentsData;
	isLoadingWooPaymentsData: boolean;
	recordTracksEvent: RecordTracksEvent;
	onDownloadReport: ( siteId: number ) => Promise< void >;
}

export default function CommissionsTable( {
	sites,
	woopaymentsData,
	isLoadingWooPaymentsData,
	recordTracksEvent,
	onDownloadReport,
}: CommissionsTableProps ) {
	const [ isGeneratingReport, setIsGeneratingReport ] = useState( false );

	const [ view, setView ] = useState< View >( {
		type: 'table',
		page: 1,
		perPage: 50,
		search: '',
		filters: [],
		sort: { field: '', direction: 'asc' },
		fields: [
			'site',
			'transactions',
			'commissionsPaid',
			'timeframeCommissions',
			'woopaymentsStatus',
			'commissionEligibility',
		],
	} );

	const fields = useMemo< Field< SitesWithWooPaymentsState >[] >(
		() => [
			{
				id: 'site',
				label: __( 'Site' ),
				getValue: ( { item } ) => item.siteUrl,
				render: ( { item } ) => <SiteColumn site={ item.siteUrl } />,
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'transactions',
				label: __( 'Transactions' ),
				getValue: () => '-',
				render: ( { item } ) =>
					isLoadingWooPaymentsData ? (
						<TextSkeleton length={ 6 } />
					) : (
						<TransactionsColumn
							transactions={ getSiteData( woopaymentsData, item.blogId ).transactions }
						/>
					),
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'commissionsPaid',
				label: __( 'Commissions paid' ),
				getValue: () => '-',
				render: ( { item } ) =>
					isLoadingWooPaymentsData ? (
						<TextSkeleton length={ 6 } />
					) : (
						<CommissionsPaidColumn payout={ getSiteData( woopaymentsData, item.blogId ).payout } />
					),
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'timeframeCommissions',
				label: __( 'Timeframe commissions' ),
				getValue: () => '-',
				render: ( { item } ) =>
					isLoadingWooPaymentsData ? (
						<TextSkeleton length={ 6 } />
					) : (
						<TimeframeCommissionsColumn
							estimatedPayout={ getSiteData( woopaymentsData, item.blogId ).estimatedPayout }
						/>
					),
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'woopaymentsStatus',
				label: __( 'WooPayments status' ),
				getValue: () => '-',
				render: ( { item } ) => (
					<WooPaymentsStatusColumn
						state={ item.state }
						siteId={ item.blogId }
						recordTracksEvent={ recordTracksEvent }
					/>
				),
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'commissionEligibility',
				label: __( 'Commission eligibility' ),
				getValue: () => '-',
				render: ( { item } ) => (
					<CommissionEligibilityColumn
						state={ item.state }
						siteId={ item.blogId }
						woopaymentsData={ woopaymentsData }
					/>
				),
				enableHiding: false,
				enableSorting: false,
			},
		],
		[ isLoadingWooPaymentsData, woopaymentsData, recordTracksEvent ]
	);

	const { data, paginationInfo } = useMemo(
		() => filterSortAndPaginate( sites, view, fields ),
		[ sites, view, fields ]
	);

	const handleDownloadCommissionsReport = useCallback(
		async ( selectedItems: SitesWithWooPaymentsState[] ) => {
			setIsGeneratingReport( true );
			try {
				await onDownloadReport( selectedItems[ 0 ].blogId );
				recordTracksEvent( 'calypso_a4a_woopayments_download_commissions_report' );
			} catch {
				recordTracksEvent( 'calypso_a4a_woopayments_download_commissions_report_error' );
			} finally {
				setIsGeneratingReport( false );
			}
		},
		[ onDownloadReport, recordTracksEvent ]
	);

	const actions = useMemo(
		() => [
			{
				id: 'visit-wp-admin',
				label: __( 'Visit WP Admin' ),
				icon: external,
				callback( items: SitesWithWooPaymentsState[] ) {
					const isInstalled = items[ 0 ].state === 'active';
					const siteUrl = items[ 0 ].siteUrl;
					const url = isInstalled
						? `${ siteUrl }/wp-admin/admin.php?page=wc-admin&path=/payments/connect`
						: `${ siteUrl }/wp-admin/plugin-install.php?s=woopayments&tab=search&type=term`;
					window.open( url, '_blank' );
					recordTracksEvent( 'calypso_a4a_woopayments_visit_wp_admin' );
				},
				isEligible( item: SitesWithWooPaymentsState ) {
					return item.state !== 'disconnected';
				},
			},
			{
				id: 'download-commissions-report',
				label: __( 'Download commissions report' ),
				icon: download,
				callback: handleDownloadCommissionsReport,
				isEligible( item: SitesWithWooPaymentsState ) {
					return item.state === 'active';
				},
			},
		],
		[ recordTracksEvent, handleDownloadCommissionsReport ]
	);

	return (
		<>
			<DataViews< SitesWithWooPaymentsState >
				data={ data }
				getItemId={ ( item ) => `${ item.blogId }` }
				paginationInfo={ paginationInfo }
				fields={ fields }
				search={ false }
				actions={ actions }
				view={ view }
				onChangeView={ setView }
				defaultLayouts={ { table: {} } }
			>
				<HStack
					className="dataviews__view-actions woopayments-commissions__view-actions"
					justify="end"
				>
					<WPDataViews.ViewConfig />
				</HStack>
				<WPDataViews.Layout />
				<WPDataViews.Footer />
			</DataViews>

			{ isGeneratingReport && (
				<Modal
					title={ __( 'Generating commissions report' ) }
					onRequestClose={ () => setIsGeneratingReport( false ) }
				>
					<HStack justify="flex-start" spacing={ 3 }>
						<Spinner />
						<Text>
							{ __( 'Your report is being prepared. The download will begin automatically.' ) }
						</Text>
					</HStack>
				</Modal>
			) }
		</>
	);
}
