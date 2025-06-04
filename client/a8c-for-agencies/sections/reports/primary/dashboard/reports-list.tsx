import { useDesktopBreakpoint } from '@automattic/viewport-react';
import { filterSortAndPaginate } from '@wordpress/dataviews';
import { chevronRight } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useMemo, useCallback } from 'react';
import { DATAVIEWS_LIST } from 'calypso/a8c-for-agencies/components/items-dashboard/constants';
import ItemsDataViews from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews';
import { DataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews/interfaces';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import {
	ReportSiteColumn,
	ReportDateColumn,
	ReportStatusColumn,
	ReportCountColumn,
} from './report-columns';
import type { SiteReports } from '../../types';

export default function ReportsList( {
	siteReports,
	dataViewsState,
	setDataViewsState,
}: {
	siteReports: SiteReports[];
	dataViewsState: DataViewsState;
	setDataViewsState: ( callback: ( prevState: DataViewsState ) => DataViewsState ) => void;
} ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const isDesktop = useDesktopBreakpoint();

	const openReportPreviewPane = useCallback(
		( report: SiteReports ) => {
			setDataViewsState( ( prevState: DataViewsState ) => ( {
				...prevState,
				selectedItem: report,
				type: DATAVIEWS_LIST,
			} ) );
			dispatch( recordTracksEvent( 'calypso_a4a_reports_list_view_details_click' ) );
		},
		[ dispatch, setDataViewsState ]
	);

	const fields = useMemo(
		() => [
			{
				id: 'site',
				label: translate( 'Site Name / URL' ),
				getValue: () => '-',
				render: ( { item }: { item: SiteReports } ) => {
					return <ReportSiteColumn site={ item.site } />;
				},
				enableHiding: false,
				enableSorting: false,
			},
			...( isDesktop && ! dataViewsState.selectedItem
				? [
						{
							id: 'reportCount',
							label: translate( 'Reports' ),
							getValue: () => '-',
							render: ( { item }: { item: SiteReports } ) => (
								<ReportCountColumn count={ item.totalReports } />
							),
							enableHiding: false,
							enableSorting: false,
						},
						{
							id: 'latestStatus',
							label: translate( 'Latest Status' ),
							getValue: () => '-',
							render: ( { item }: { item: SiteReports } ) => (
								<ReportStatusColumn status={ item.latestReport.status } />
							),
							enableHiding: false,
							enableSorting: false,
						},
						{
							id: 'dateSent',
							label: translate( 'Last Generated' ),
							getValue: () => '-',
							render: ( { item }: { item: SiteReports } ) => (
								<ReportDateColumn date={ item.latestReport.createdAt } />
							),
							enableHiding: false,
							enableSorting: false,
						},
				  ]
				: [] ),
		],
		[ translate, isDesktop, dataViewsState.selectedItem ]
	);

	const { data, paginationInfo } = useMemo( () => {
		return filterSortAndPaginate( siteReports, dataViewsState, fields );
	}, [ siteReports, dataViewsState, fields ] );

	const actions = useMemo( () => {
		if ( dataViewsState.type === 'table' ) {
			return [
				{
					id: 'view-details',
					label: translate( 'View Details' ),
					isPrimary: true,
					icon: chevronRight,
					callback( items: SiteReports[] ) {
						openReportPreviewPane( items[ 0 ] );
					},
				},
			];
		}
		return [];
	}, [ translate, openReportPreviewPane, dataViewsState.type ] );

	return (
		<div className="redesigned-a8c-table full-width">
			<ItemsDataViews
				data={ {
					items: data,
					getItemId: ( item: SiteReports ) => item.site,
					onSelectionChange: ( data ) => {
						const report = siteReports.find( ( r ) => r.site === data[ 0 ] );
						if ( report ) {
							openReportPreviewPane( report );
						}
					},
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
	);
}
