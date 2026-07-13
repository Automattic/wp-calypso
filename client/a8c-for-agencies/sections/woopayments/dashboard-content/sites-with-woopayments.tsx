import { useDesktopBreakpoint } from '@automattic/viewport-react';
import { __experimentalHStack as HStack, Button, Modal, Spinner } from '@wordpress/components';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { Icon, external, download, close } from '@wordpress/icons';
import { useMemo, useState, useCallback } from 'react';
import TextPlaceholder from 'calypso/a8c-for-agencies/components/text-placeholder';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { useWooPaymentsContext } from '../context';
import { useDownloadCommissionsReport } from '../hooks/use-download-commissions-report';
import { getSiteData } from '../lib/site-data';
import SitesWithWooPaymentsMobileView from './mobile-view';
import {
	SiteColumn,
	TransactionsColumn,
	CommissionsPaidColumn,
	TimeframeCommissionsColumn,
	WooPaymentsStatusColumn,
	CommissionEligibilityColumn,
} from './site-columns';
import type { SitesWithWooPaymentsState } from '../types';
import type { Field, View } from '@wordpress/dataviews';

export default function SitesWithWooPayments() {
	const {
		sitesWithPluginsStates: items,
		woopaymentsData,
		isLoadingWooPaymentsData,
	} = useWooPaymentsContext();
	const dispatch = useDispatch();
	const { downloadCommissionsReport } = useDownloadCommissionsReport();

	const isDesktop = useDesktopBreakpoint();

	const [ downloadModal, setDownloadModal ] = useState< {
		isVisible: boolean;
		isLoading: boolean;
		siteId?: number;
		siteUrl?: string;
	} >( {
		isVisible: false,
		isLoading: false,
	} );

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
		layout: {
			styles: {
				site: { minWidth: '260px' },
				transactions: { minWidth: '120px' },
				commissionsPaid: { minWidth: '150px' },
				timeframeCommissions: { minWidth: '170px' },
				woopaymentsStatus: { minWidth: '160px' },
				commissionEligibility: { minWidth: '190px' },
			},
		},
	} );

	const fields = useMemo< Field< SitesWithWooPaymentsState >[] >(
		() => [
			{
				id: 'site',
				label: __( 'Site' ),
				getValue: () => '-',
				render: ( { item }: { item: SitesWithWooPaymentsState } ) => (
					<SiteColumn site={ item.siteUrl } />
				),
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'transactions',
				label: __( 'Transactions' ),
				getValue: () => '-',
				render: ( { item } ) => {
					if ( isLoadingWooPaymentsData ) {
						return <TextPlaceholder />;
					}
					const { transactions } = getSiteData( woopaymentsData, item.blogId );
					return <TransactionsColumn transactions={ transactions } />;
				},
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'commissionsPaid',
				label: __( 'Commissions paid' ),
				getValue: () => '-',
				render: ( { item } ) => {
					if ( isLoadingWooPaymentsData ) {
						return <TextPlaceholder />;
					}
					const { payout } = getSiteData( woopaymentsData, item.blogId );
					return <CommissionsPaidColumn payout={ payout } />;
				},
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'timeframeCommissions',
				label: __( 'Timeframe commissions' ),
				getValue: () => '-',
				render: ( { item } ) => {
					if ( isLoadingWooPaymentsData ) {
						return <TextPlaceholder />;
					}
					const { estimatedPayout } = getSiteData( woopaymentsData, item.blogId );
					return <TimeframeCommissionsColumn estimatedPayout={ estimatedPayout } />;
				},
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'woopaymentsStatus',
				label: __( 'WooPayments status' ),
				getValue: () => '-',
				render: ( { item } ) => (
					<WooPaymentsStatusColumn state={ item.state } siteId={ item.blogId } />
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
		[ isLoadingWooPaymentsData, woopaymentsData ]
	);

	const { data, paginationInfo } = useMemo( () => {
		return filterSortAndPaginate( items, view, fields );
	}, [ items, view, fields ] );

	const handleDownloadCommissionsReport = useCallback(
		async ( selectedItems: SitesWithWooPaymentsState[] ) => {
			const selectedSite = selectedItems[ 0 ];
			setDownloadModal( {
				isVisible: true,
				isLoading: true,
				siteId: selectedSite.blogId,
				siteUrl: selectedSite.siteUrl,
			} );

			try {
				await downloadCommissionsReport( selectedSite.blogId );
				dispatch( recordTracksEvent( 'calypso_a4a_woopayments_download_commissions_report' ) );
			} catch ( error ) {
				dispatch(
					recordTracksEvent( 'calypso_a4a_woopayments_download_commissions_report_error' )
				);
			} finally {
				setDownloadModal( { isVisible: false, isLoading: false } );
			}
		},
		[ downloadCommissionsReport, dispatch ]
	);

	const handleCancelDownload = useCallback( () => {
		setDownloadModal( { isVisible: false, isLoading: false } );
	}, [] );

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
					dispatch( recordTracksEvent( 'calypso_a4a_woopayments_visit_wp_admin' ) );
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
		[ dispatch, handleDownloadCommissionsReport ]
	);

	return (
		<>
			{ ! isDesktop ? (
				<SitesWithWooPaymentsMobileView items={ items } actions={ actions } />
			) : (
				<div className="redesigned-a8c-table full-width">
					<DataViews< SitesWithWooPaymentsState >
						data={ data }
						getItemId={ ( item ) => `${ item.blogId }` }
						paginationInfo={ paginationInfo }
						search={ false }
						fields={ fields }
						actions={ actions }
						view={ view }
						onChangeView={ setView }
						defaultLayouts={ { table: {} } }
					>
						<HStack
							className="dataviews__view-actions"
							justify="end"
							style={ { paddingInline: '64px' } }
						>
							<DataViews.ViewConfig />
						</HStack>
						<DataViews.Layout />
						<DataViews.Footer />
					</DataViews>
				</div>
			) }

			{ downloadModal.isVisible && (
				<Modal
					className="download-commissions-modal"
					onRequestClose={ handleCancelDownload }
					__experimentalHideHeader
				>
					<Button
						className="download-commissions-modal__close-button"
						onClick={ handleCancelDownload }
						aria-label={ __( 'Close' ) }
					>
						<Icon size={ 24 } icon={ close } />
					</Button>
					<h1 className="download-commissions-modal__title">
						{ __( 'Generating commissions report' ) }
					</h1>

					<div className="download-commissions-modal__instruction">
						<Spinner />
						<div className="download-commissions-modal__instruction-text">
							{ __( 'Your report is being prepared.' ) }
							<br />
							{ __( 'The download will begin automatically.' ) }
						</div>
					</div>
				</Modal>
			) }
		</>
	);
}
