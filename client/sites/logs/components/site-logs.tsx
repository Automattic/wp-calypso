import page from '@automattic/calypso-router';
import {
	Button,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
	ToggleControl,
} from '@wordpress/components';
import { DataViews } from '@wordpress/dataviews';
import { download } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState, useMemo } from 'react';
import QuerySiteSettings from 'calypso/components/data/query-site-settings';
import DateControl from 'calypso/components/date-control';
import { getShortcuts } from 'calypso/components/date-range/use-shortcuts';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import NavigationHeader from 'calypso/components/navigation-header';
import {
	LogType,
	LogQueryParams,
	PHPLog,
	ServerLog,
} from 'calypso/data/hosting/use-site-logs-query';
import { useInterval } from 'calypso/lib/interval';
import { navigate } from 'calypso/lib/navigate';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import useActions from '../hooks/use-actions';
import useData from '../hooks/use-data';
import useFields from '../hooks/use-fields';
import { useSiteLogsDownloader } from '../hooks/use-site-logs-downloader';
import {
	default as useView,
	toFilterParams,
	getSortField,
	getVisibleFields,
	getFilterValue,
} from '../hooks/use-view';
import DetailsModal from './details-modal';
import type { View, Action, Filter } from '@wordpress/dataviews';
import type { Moment } from 'moment';
import './style.scss';

export const SiteLogsDataViews = ( {
	logType,
	query,
}: {
	logType: LogType;
	query: LogQueryParams;
} ) => {
	const translate = useTranslate();
	const moment = useLocalizedMoment();
	const siteId = useSelector( getSelectedSiteId );
	const dispatch = useDispatch();

	const getMomentFromTimestamp = useCallback(
		( value: string, fallback?: string ) => {
			const fromValue = parseInt( value || '', 10 );
			if ( ! isNaN( fromValue ) ) {
				return moment.unix( fromValue );
			}

			if ( fallback === '7-days-ago' ) {
				return moment().subtract( 7, 'd' );
			}

			return moment();
		},
		[ moment ]
	);

	const getTimestampFor7DaysAgo = useCallback(
		() => moment().subtract( 7, 'd' ).unix().toString( 10 ),
		[ moment ]
	);
	const getTimestampForNow = useCallback( () => moment().unix().toString( 10 ), [ moment ] );

	const startTime = useMemo(
		() => getMomentFromTimestamp( query.from, '7-days-ago' ),
		[ query.from, getMomentFromTimestamp ]
	);
	const endTime = useMemo(
		() => getMomentFromTimestamp( query.to ),
		[ query.to, getMomentFromTimestamp ]
	);
	const dateRange = useMemo( () => {
		const daysInRange = endTime.diff( startTime, 'days' );
		return {
			chartStart: startTime.format( 'YYYY-MM-DD' ),
			chartEnd: endTime.format( 'YYYY-MM-DD' ),
			daysInRange,
		};
	}, [ startTime, endTime ] );

	const { supportedShortcutList } = useSelector( ( state ) =>
		getShortcuts( state, dateRange, translate )
	);

	const [ autoRefresh, setAutoRefresh ] = useState( false );
	const autoRefreshCallback = useCallback( () => {
		const url = new URL( window.location.href );
		url.searchParams.set( 'from', getTimestampFor7DaysAgo() );
		url.searchParams.set( 'to', getTimestampForNow() );
		page.replace( url.pathname + url.search );
	}, [ getTimestampFor7DaysAgo, getTimestampForNow ] );
	useInterval( autoRefreshCallback, autoRefresh && 10 * 1000 );
	const handleAutoRefreshClick = ( isChecked: boolean ) => {
		if ( isChecked ) {
			const url = new URL( window.location.href );
			url.searchParams.delete( 'from' );
			url.searchParams.delete( 'to' );
			page.replace( url.pathname + url.search );
		} else {
			const url = new URL( window.location.href );
			url.searchParams.set( 'from', getTimestampFor7DaysAgo() );
			url.searchParams.set( 'to', getTimestampForNow() );
			page.replace( url.pathname + url.search );
		}

		dispatch( recordTracksEvent( 'calypso_site_logs_auto_refresh', { enabled: isChecked } ) );
		setAutoRefresh( isChecked );
	};

	const handleTimeChange = useCallback( ( updatedStartTime: Moment, updatedEndTime: Moment ) => {
		setAutoRefresh( false );

		const url = new URL( window.location.href );

		if ( ! updatedStartTime.isValid() ) {
			url.searchParams.delete( 'from' );
		} else {
			url.searchParams.set( 'from', updatedStartTime.unix().toString( 10 ) );
		}

		if ( ! updatedEndTime.isValid() ) {
			url.searchParams.delete( 'to' );
		} else {
			url.searchParams.set( 'to', updatedEndTime.unix().toString( 10 ) );
		}

		page.replace( url.pathname + url.search );
	}, [] );

	const [ view, setView ] = useView( { logType, query } );
	const oldSeverity = getFilterValue( view, 'severity' )?.sort().toString() || '';
	const setViewWithSideEffects = useCallback(
		( newView: View ) => {
			const severity = getFilterValue( newView, 'severity' )?.sort().toString() || '';
			if ( severity !== oldSeverity ) {
				dispatch(
					recordTracksEvent( 'calypso_site_logs_severity_filter', {
						severity,
						severity_user: severity.includes( 'User' ),
						severity_warning: severity.includes( 'Warning' ),
						severity_deprecated: severity.includes( 'Deprecated' ),
						severity_fatal: severity.includes( 'Fatal' ),
					} )
				);
			}

			// Disable auto-refresh if the user navigates to a different page.
			if ( autoRefresh === true && newView.page !== view.page ) {
				setAutoRefresh( false );
			}

			setView( newView );

			// Handle URL changes.
			const url = new URL( window.location.href );
			const isEmpty = ( filter: Filter | undefined ) =>
				! filter || ! filter?.value || filter?.value.length === 0;
			[ 'severity', 'request_type', 'status', 'renderer', 'cached' ].forEach( ( filterField ) => {
				const filter = newView.filters?.find( ( f ) => f.field === filterField );

				// Use cases to cover:
				//
				// 1. URL doesn't have the filter and the filter is empty. Do nothing.
				// 2. URL doesn't have the filter and the filter is not empty. Update URL param.
				// 3. URL has the filter and the filter is the same as before. Do nothing.
				// 4. URL has the filter and the filter is different from before. Update URL param.
				// 5. URL has the filter and the filter is empty. Remove URL param.

				if ( ! url.searchParams.has( filterField ) && isEmpty( filter ) ) {
					return;
				}

				if ( ! url.searchParams.has( filterField ) && ! isEmpty( filter ) ) {
					url.searchParams.set( filterField, filter?.value.sort().toString() );
				}

				if (
					url.searchParams.has( filterField ) &&
					url.searchParams.get( filterField ) === filter?.value.sort().toString()
				) {
					return;
				}

				if (
					url.searchParams.has( filterField ) &&
					url.searchParams.get( filterField ) !== filter?.value.sort().toString()
				) {
					url.searchParams.set( filterField, filter?.value.sort().toString() );
				}

				if ( url.searchParams.has( filterField ) && isEmpty( filter ) ) {
					url.searchParams.delete( filterField );
				}
			} );

			page.replace( url.pathname + url.search );
		},
		[ autoRefresh, setAutoRefresh, oldSeverity, view.page, setView, dispatch ]
	);

	const fields = useFields( { logType } );
	const { data, paginationInfo, isLoading } = useData( {
		view,
		logType,
		startTime,
		endTime,
	} );
	const actions: Action< PHPLog | ServerLog >[] = useActions( { logType, isLoading } );

	const { downloadLogs, state } = useSiteLogsDownloader( { roundDateRangeToWholeDays: false } );
	const isDownloading = state.status === 'downloading';
	const onDownloadLogs = useCallback( () => {
		downloadLogs( {
			logType,
			startDateTime: startTime,
			endDateTime: endTime,
			filter: toFilterParams( { view, logType } ),
		} );
	}, [ downloadLogs, logType, startTime, endTime, view ] );

	const [ itemDetailsModal, setItemDetailsModal ] = useState< PHPLog | ServerLog | null >( null );
	const onOpenDetailsModal = useCallback( ( item: PHPLog | ServerLog ) => {
		setItemDetailsModal( item );
	}, [] );
	const onCloseDetailsModal = useCallback( () => {
		setItemDetailsModal( null );
	}, [] );

	return (
		<>
			{ siteId && <QuerySiteSettings siteId={ siteId } /> }
			{ !! itemDetailsModal && (
				<DetailsModal
					item={ itemDetailsModal }
					logType={ logType }
					onClose={ onCloseDetailsModal }
				/>
			) }
			<div className="site-logs-header">
				<NavigationHeader
					title={ translate( 'Logs' ) }
					subtitle={ translate(
						'View and download various server logs. {{link}}Learn more{{/link}}',
						{
							components: {
								link: (
									<InlineSupportLink supportContext="site-monitoring-logs" showIcon={ false } />
								),
							},
						}
					) }
				/>
				<ToggleGroupControl
					className="site-logs-toolbar__toggle"
					hideLabelFromVision
					label=""
					onChange={ ( value ) => {
						if ( value === LogType.PHP || value === LogType.WEB ) {
							navigate( window.location.pathname.replace( /\/[^/]+$/, '/' + value ) );
							setView( ( view: View ) => ( {
								...view,
								filters: [],
								sort: {
									field: getSortField( value ),
									direction: view?.sort?.direction || 'desc',
								},
								titleField: getSortField( value ),
								fields: getVisibleFields( value ),
							} ) );
						}
					} }
					value={ logType }
					__nextHasNoMarginBottom
				>
					<ToggleGroupControlOption
						className="site-logs-toolbar__toggle-option"
						label={ translate( 'PHP error', {
							textOnly: true,
						} ) }
						value="php"
					/>
					<ToggleGroupControlOption
						className="site-logs-toolbar__toggle-option"
						label={ translate( 'Web server', {
							textOnly: true,
						} ) }
						value="web"
					/>
				</ToggleGroupControl>
				<DateControl
					dateRange={ dateRange }
					onApplyButtonClick={ handleTimeChange }
					shortcutList={ supportedShortcutList }
					onShortcutClick={ ( shortcut, closePopoverAndCommit ) => {
						/* Time change is handled by onApplyButtonClick */
						closePopoverAndCommit();
					} }
					tooltip={ translate( 'Select a date range' ) }
				/>
			</div>
			<DataViews< PHPLog | ServerLog >
				data={ data }
				isLoading={ isLoading }
				paginationInfo={ paginationInfo }
				fields={ fields }
				view={ view }
				onChangeView={ setViewWithSideEffects }
				onClickItem={ onOpenDetailsModal }
				actions={ actions }
				search={ false }
				defaultLayouts={ { table: {} } }
				header={
					<>
						<Button
							size="compact"
							icon={ download }
							label="Download logs"
							onClick={ onDownloadLogs }
							isBusy={ isDownloading }
						/>
						<ToggleControl
							__nextHasNoMarginBottom
							className="site-logs__auto-refresh site-logs__auto-refresh_desktop"
							label={ translate( 'Auto-refresh', { textOnly: true } ) }
							checked={ autoRefresh }
							onChange={ handleAutoRefreshClick }
						/>
					</>
				}
			/>
		</>
	);
};
