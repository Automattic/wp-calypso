import { filterSortAndPaginate } from '@wordpress/dataviews';
import { useMemo, useCallback } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { DATAVIEWS_LIST } from 'calypso/a8c-for-agencies/components/items-dashboard/constants';
import ItemsDataViews from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews';
import { DataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews/interfaces';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import type { Field, Action } from '@wordpress/dataviews';
import type { ReactNode } from 'react';

import './style.scss';

interface Report {
	id: string;
	siteNameOrUrl: string;
	dateSent: string;
	status: string;
}

interface Props {
	reports: Report[];
	dataViewsState: DataViewsState;
	setDataViewsState: ( callback: ( prevState: DataViewsState ) => DataViewsState ) => void;
}

export default function ReportsList( { reports, dataViewsState, setDataViewsState }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const openReportPreviewPane = useCallback(
		( report: Report ) => {
			setDataViewsState( ( prevState: DataViewsState ) => ( {
				...prevState,
				selectedItem: report,
				type: DATAVIEWS_LIST,
			} ) );
			dispatch( recordTracksEvent( 'calypso_a4a_reports_list_view_details_click' ) );
		},
		[ dispatch, setDataViewsState ]
	);

	const fields: Field< Report >[] = useMemo(
		() => [
			{
				id: 'siteNameOrUrl',
				label: translate( 'Site Name / URL' ).toUpperCase(),
				getValue: () => '-',
				render: ( { item }: { item: Report } ): ReactNode => (
					<span className="a4a-reports-site-name-or-url">{ item.siteNameOrUrl }</span>
				),
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'dateSent',
				label: translate( 'Date Sent' ).toUpperCase(),
				getValue: () => '-',
				render: ( { item }: { item: Report } ): ReactNode => (
					<span className="a4a-reports-date-sent">{ item.dateSent }</span>
				),
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'status',
				label: translate( 'Status' ).toUpperCase(),
				getValue: () => '-',
				render: ( { item }: { item: Report } ): ReactNode => (
					<span className="a4a-reports-status">{ item.status }</span>
				),
				enableHiding: false,
				enableSorting: false,
			},
		],
		[ translate ]
	);

	const actions: Action< Report >[] = useMemo( () => {
		if ( dataViewsState.type === 'table' ) {
			return [
				{
					id: 'view-report',
					label: translate( 'View' ),
					isPrimary: true,
					callback( items ) {
						openReportPreviewPane( items[ 0 ] );
					},
				},
				{
					id: 'duplicate-report',
					label: translate( 'Duplicate' ),
					isPrimary: false,
					callback() {
						// TODO: Implement duplicate report functionality
						dispatch( recordTracksEvent( 'calypso_a4a_reports_list_duplicate_report_click' ) );
					},
				},
				{
					id: 'delete-report',
					label: translate( 'Delete' ),
					isPrimary: false,
					isDestructive: true,
					callback() {
						// TODO: Implement delete report functionality
						dispatch( recordTracksEvent( 'calypso_a4a_reports_list_delete_report_click' ) );
					},
				},
			];
		}

		return [];
	}, [ openReportPreviewPane, translate, dataViewsState.type, dispatch ] );

	const placeholderReport: Report = useMemo(
		() => ( {
			id: 'placeholder-1',
			siteNameOrUrl: translate( 'example.com' ),
			dateSent: translate( 'October 26, 2023' ),
			status: translate( 'Sent' ),
		} ),
		[ translate ]
	);

	const { data: items, paginationInfo: pagination } = useMemo( () => {
		const reportsToDisplay = reports.length > 0 ? reports : [ placeholderReport ];
		return filterSortAndPaginate( reportsToDisplay, dataViewsState, fields );
	}, [ reports, placeholderReport, dataViewsState, fields ] );

	return (
		<div className="redesigned-a8c-table full-width">
			<ItemsDataViews
				data={ {
					items,
					getItemId: ( item: Report ) => `${ item.id }`,
					onSelectionChange: ( data ) => {
						const allReports = reports.length > 0 ? reports : [ placeholderReport ];
						const report = allReports.find( ( r ) => r.id === data[ 0 ] );
						if ( report ) {
							openReportPreviewPane( report );
						}
					},
					pagination,
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
