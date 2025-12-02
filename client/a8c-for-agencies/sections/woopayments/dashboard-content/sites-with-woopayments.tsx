import { useDesktopBreakpoint } from '@automattic/viewport-react';
import { Button, Modal, Spinner } from '@wordpress/components';
import { filterSortAndPaginate } from '@wordpress/dataviews';
import { Icon, external, download, close } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useMemo, useState, useCallback } from 'react';
import { initialDataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/constants';
import ItemsDataViews from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews';
import { DataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews/interfaces';
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
} from './site-columns';
import type { SitesWithWooPaymentsState } from '../types';

export default function SitesWithWooPayments() {
	const translate = useTranslate();
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

	const [ dataViewsState, setDataViewsState ] = useState< DataViewsState >( {
		...initialDataViewsState,
		fields: [
			'site',
			'transactions',
			'commissionsPaid',
			'timeframeCommissions',
			'woopaymentsStatus',
		],
	} );

	const fields = useMemo(
		() => [
			{
				id: 'site',
				label: translate( 'Site' ).toUpperCase(),
				getValue: () => '-',
				render: ( { item }: { item: SitesWithWooPaymentsState } ) => (
					<SiteColumn site={ item.siteUrl } />
				),
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'transactions',
				label: translate( 'Transactions' ).toUpperCase(),
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
				label: translate( 'Commissions Paid' ).toUpperCase(),
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
				label: translate( 'Timeframe Commissions' ).toUpperCase(),
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
				label: translate( 'WooPayments Status' ).toUpperCase(),
				getValue: () => '-',
				render: ( { item } ) => (
					<WooPaymentsStatusColumn
						state={ item.state }
						siteId={ item.blogId }
						woopaymentsData={ woopaymentsData }
					/>
				),
				enableHiding: false,
				enableSorting: false,
			},
		],
		[ isLoadingWooPaymentsData, translate, woopaymentsData ]
	);

	const { data, paginationInfo } = useMemo( () => {
		return filterSortAndPaginate( items, dataViewsState, fields );
	}, [ items, dataViewsState, fields ] );

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
				label: translate( 'Visit WP Admin' ),
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
				label: translate( 'Download commissions report' ),
				icon: download,
				callback: handleDownloadCommissionsReport,
				isEligible( item: SitesWithWooPaymentsState ) {
					return item.state === 'active';
				},
			},
		],
		[ translate, dispatch, handleDownloadCommissionsReport ]
	);

	return (
		<>
			{ ! isDesktop ? (
				<SitesWithWooPaymentsMobileView items={ items } actions={ actions } />
			) : (
				<div className="redesigned-a8c-table full-width">
					<ItemsDataViews
						data={ {
							items: data,
							getItemId: ( item: SitesWithWooPaymentsState ) => `${ item.blogId }`,
							pagination: paginationInfo,
							enableSearch: false,
							fields,
							actions,
							setDataViewsState,
							dataViewsState,
							defaultLayouts: { table: {} },
						} }
					/>
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
						aria-label={ translate( 'Close' ) }
					>
						<Icon size={ 24 } icon={ close } />
					</Button>
					<h1 className="download-commissions-modal__title">
						{ translate( 'Generating commissions report' ) }
					</h1>

					<div className="download-commissions-modal__instruction">
						<Spinner />
						<div className="download-commissions-modal__instruction-text">
							{ translate( 'Your report is being prepared.' ) }
							<br />
							{ translate( 'The download will begin automatically.' ) }
						</div>
					</div>
				</Modal>
			) }
		</>
	);
}
