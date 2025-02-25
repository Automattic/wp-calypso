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
import { LogType, PHPLog, ServerLog } from 'calypso/data/hosting/use-site-logs-query';
import { useInterval } from 'calypso/lib/interval';
import { navigate } from 'calypso/lib/navigate';
import { useSiteLogsDownloader } from 'calypso/sites/tools/logs/hooks/use-site-logs-downloader';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import DetailsModal from './components/details-modal';
import useActions from './hooks/use-actions';
import useData from './hooks/use-data';
import useFields from './hooks/use-fields';
import {
	default as useView,
	toFilterParams,
	getSortField,
	getVisibleFields,
	getFilterValue,
} from './hooks/use-view';
import type { View, Action } from '@wordpress/dataviews';
import type { Moment } from 'moment';
import './style.scss';

export const SiteLogsDataViews = ( {
	logType,
	query,
}: {
	logType: LogType;
	query: { from: string; to: string };
} ) => {
	const translate = useTranslate();
	const moment = useLocalizedMoment();
	const siteId = useSelector( getSelectedSiteId );

	const dispatch = useDispatch();

	/**
	 * Generates a unique key for each row.
	 * The ID only needs to be unique for each render, because it's used in selection
	 * or as keys for react components.
	 *
	 * - The PHP logs have a resolution of 1 second,
	 *   so there's no single property that can act as an unique ID.
	 *   It's unlikely the same line will trigger an error within the same second.
	 *
	 * - The Server logs have a resolution of 1 ms,
	 *   so the date is a better unique ID on its own,
	 *   but still add some entrophy, just in case.
	 *
	 */
	const getItemId = useMemo(
		() => ( item: PHPLog | ServerLog ) => {
			if ( logType === 'php' ) {
				const phpLog = item as PHPLog;
				return `${ phpLog.timestamp }-${ phpLog.file }-${ phpLog.line }`;
			}

			if ( logType === 'web' ) {
				const serverLog = item as ServerLog;
				return `${ serverLog.date }-${ serverLog.request_time }-${ serverLog.body_bytes_sent }`;
			}

			return 'unknown';
		},
		[ logType ]
	);

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

	const [ view, setView ] = useView( { logType } );
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
					actions={ actions }
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
						if ( value === 'php' || value === 'web' ) {
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
				getItemId={ getItemId }
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
