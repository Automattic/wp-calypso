import { useTranslate } from 'i18n-calypso';
import { get, isEmpty, map } from 'lodash';
import { useReducer } from 'react';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { FilterType } from 'calypso/data/hosting/use-site-logs-query';
import wpcom from 'calypso/lib/wp';
import { LogType } from 'calypso/sites/tools/logs';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import type { Moment } from 'moment';

interface LogsAPIResponse {
	data: {
		logs: Record< string, unknown >[];
		scroll_id: string | null;
		total_results: number;
	};
}

const initialState = {
	status: 'idle' as const,
};

type SiteLogsDownloaderReducerState =
	| { status: 'idle' }
	| { status: 'downloading'; recordsDownloaded: number; totalRecordsAvailable: number }
	| { status: 'error' }
	| { status: 'complete'; recordsDownloaded: number; totalRecordsAvailable: number };

type SiteLogsDownloaderReducerAction =
	| {
			type: 'DOWNLOAD_START';
	  }
	| {
			type: 'DOWNLOAD_UPDATE';
			payload: { recordsDownloaded: number; totalRecordsAvailable: number };
	  }
	| { type: 'DOWNLOAD_ERROR' }
	| {
			type: 'DOWNLOAD_COMPLETE';
			payload: { recordsDownloaded: number; totalRecordsAvailable: number };
	  };

const MAX_LOGS_DOWNLOAD = 10_000;

const siteLogsDownloaderReducer = (
	state: SiteLogsDownloaderReducerState = initialState,
	action: SiteLogsDownloaderReducerAction
): SiteLogsDownloaderReducerState => {
	if ( action.type === 'DOWNLOAD_START' ) {
		return {
			status: 'downloading',
			recordsDownloaded: 0,
			totalRecordsAvailable: 0,
		};
	}

	if ( action.type === 'DOWNLOAD_UPDATE' ) {
		return {
			status: 'downloading',
			...action.payload,
		};
	}

	if ( action.type === 'DOWNLOAD_ERROR' ) {
		return {
			status: 'error',
		};
	}

	if ( action.type === 'DOWNLOAD_COMPLETE' ) {
		return {
			status: 'complete',
			...action.payload,
		};
	}

	return state;
};

interface UseSiteLogsDownloaderArgs {
	logType: LogType;
	startDateTime: Moment;
	endDateTime: Moment;
	filter: FilterType;
}

export const useSiteLogsDownloader = ( {
	roundDateRangeToWholeDays = true,
}: { roundDateRangeToWholeDays?: boolean } = {} ) => {
	const moment = useLocalizedMoment();
	const translate = useTranslate();
	const localeDateFormat = moment.localeData().longDateFormat( 'L' );

	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug );

	const reduxDispatch = useDispatch();

	const recordDownloadStarted = ( props: Record< string, unknown > ) =>
		reduxDispatch( recordTracksEvent( 'calypso_atomic_logs_download_started', props ) );

	const recordDownloadCompleted = ( props: Record< string, unknown > ) =>
		reduxDispatch( recordTracksEvent( 'calypso_atomic_logs_download_completed', props ) );

	const recordDownloadError = ( props: Record< string, unknown > ) =>
		reduxDispatch( recordTracksEvent( 'calypso_atomic_logs_download_error', props ) );

	const downloadSuccessNotice = ( ...props: Parameters< typeof successNotice > ) =>
		reduxDispatch( successNotice( ...props ) );

	const downloadErrorNotice = ( ...props: Parameters< typeof errorNotice > ) =>
		reduxDispatch( errorNotice( ...props ) );

	const [ state, dispatch ] = useReducer( siteLogsDownloaderReducer, initialState );

	const downloadLogs = async ( {
		logType,
		startDateTime,
		endDateTime,
		filter,
	}: UseSiteLogsDownloaderArgs ) => {
		dispatch( {
			type: 'DOWNLOAD_START',
		} );

		let path = null;
		if ( logType === 'php' ) {
			path = `/sites/${ siteId }/hosting/error-logs`;
		} else if ( logType === 'web' ) {
			path = `/sites/${ siteId }/hosting/logs`;
		} else {
			downloadErrorNotice( translate( 'Invalid log type specified' ) );
			dispatch( {
				type: 'DOWNLOAD_ERROR',
			} );
			return;
		}

		const startMoment = roundDateRangeToWholeDays
			? moment.utc( startDateTime, localeDateFormat ).startOf( 'day' )
			: moment.utc( startDateTime, localeDateFormat );
		const endMoment = roundDateRangeToWholeDays
			? moment.utc( endDateTime, localeDateFormat ).endOf( 'day' )
			: moment.utc( endDateTime, localeDateFormat );

		const dateFormat = 'YYYYMMDDHHmmss';
		const startString = startMoment.format( dateFormat );
		const endString = endMoment.format( dateFormat );

		const startTime = startMoment.unix();
		const endTime = endMoment.unix();

		const trackDateFormat = 'YYYY/MM/DD';
		const tracksProps = {
			site_slug: siteSlug,
			site_id: siteId,
			start_time: startMoment.format( trackDateFormat ),
			end_time: endMoment.format( trackDateFormat ),
			log_type: logType,
		};

		recordDownloadStarted( tracksProps );

		let scrollId = null;
		let logs: string[] = [];
		let logFile = new Blob();
		let totalLogs = 0;
		let isError = false;

		do {
			await wpcom.req
				.get(
					{
						path,
						apiNamespace: 'wpcom/v2',
					},
					{
						start: startTime,
						end: endTime,
						filter: filter,
						page_size: 500,
						scroll_id: scrollId,
					}
				)
				.then( ( response: LogsAPIResponse ) => {
					const newLogData = get( response, 'data.logs', [] );
					scrollId = get( response, 'data.scroll_id', null );

					if ( isEmpty( logs ) ) {
						if ( isEmpty( newLogData ) ) {
							downloadErrorNotice( translate( 'No logs available for this time range' ) );
							isError = true;
						} else {
							logs = [ Object.keys( newLogData[ 0 ] ).join( ',' ) + '\n' ];
							totalLogs = get( response, 'data.total_results', 1 );
						}
					}

					logs = [
						...logs,
						...map( newLogData, ( entry ) => {
							return Object.values( entry ).join( ',' ) + '\n';
						} ),
					];

					if ( logs.length > MAX_LOGS_DOWNLOAD ) {
						scrollId = null;
					}

					dispatch( {
						type: 'DOWNLOAD_UPDATE',
						payload: {
							recordsDownloaded: logs.length - 1,
							totalRecordsAvailable: totalLogs,
						},
					} );
				} )
				.catch( ( error: { message: string; status: number } ) => {
					isError = true;
					let message = get( error, 'message', 'Could not retrieve logs.' );
					if ( error?.status === 500 ) {
						message = translate( 'Could not retrieve logs. Please try again in a few minutes.' );
					} else if ( error?.status === 400 ) {
						message = translate( 'Could not retrieve. Please try with a different time range.' );
					}
					downloadErrorNotice( message );
					recordDownloadError( {
						error_message: message,
						...tracksProps,
					} );
				} );
		} while ( null !== scrollId );

		if ( isError ) {
			dispatch( { type: 'DOWNLOAD_ERROR' } );
			return;
		}

		logFile = new Blob( logs );

		const url = window.URL.createObjectURL( logFile );
		const link = document.createElement( 'a' );
		const downloadFilename =
			siteSlug + '-' + logType + '-logs-' + startString + '-' + endString + '.csv';
		link.href = url;
		link.setAttribute( 'download', downloadFilename );
		link.click();
		window.URL.revokeObjectURL( url );

		downloadSuccessNotice( translate( 'Logs downloaded.' ) );
		recordDownloadCompleted( {
			download_filename: downloadFilename,
			total_log_records_downloaded: totalLogs,
			...tracksProps,
		} );
		dispatch( {
			type: 'DOWNLOAD_COMPLETE',
			payload: {
				recordsDownloaded: logs.length - 1,
				totalRecordsAvailable: totalLogs,
			},
		} );
	};

	return { downloadLogs, state };
};
