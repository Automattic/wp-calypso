import {
	LogType,
	fetchSiteLogsBatch,
	PHPLogFromEndpoint,
	ServerLogFromEndpoint,
} from '@automattic/api-core';
import { TZDate } from '@automattic/ui';
import {
	Button,
	Tooltip,
	Spinner,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { download } from '@wordpress/icons';
import { format } from 'date-fns';
import { useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import type { FilterType } from '@automattic/api-core';

import './style.scss';

const MAX_LOGS_DOWNLOAD = 10_000;
const MAX_BATCH_RETRIES = 3;
const MAX_DOWNLOAD_RETRIES = 5;
const BASE_RETRY_DELAY_MS = 2000;
const MIN_PAGE_SIZE = 200; // If we go lower than this we risk timeouts
const MAX_EMPTY_BATCHES = 3;

type DownloadLogsSuccess = {
	ok: true;
	message: string;
	fileName: string;
	totalAvailable: number;
	downloadedCount: number;
};

type DownloadLogsError = {
	ok: false;
	message: string;
};

type DownloadLogsResult = DownloadLogsSuccess | DownloadLogsError;

type LogEntry = PHPLogFromEndpoint | ServerLogFromEndpoint;

type ProgressCallback = ( progress: number ) => void;

function csvEscape( value: unknown ): string {
	const str = value == null ? '' : String( value );
	const needsQuotes = /[",\n]/.test( str );
	const escaped = str.replace( /"/g, '""' );
	return needsQuotes ? `"${ escaped }"` : escaped;
}

/**
 * Exponential backoff with jitter
 */
async function waitWithBackoff( attempt: number ) {
	const delay = BASE_RETRY_DELAY_MS * Math.pow( 2, attempt - 1 ) + Math.random() * 1000;
	await new Promise( ( res ) => setTimeout( res, delay ) );
}

/**
 * Fetch logs in a single download attempt (all batches)
 */
async function downloadSiteLogsOnce( args: {
	siteId: number;
	siteSlug: string;
	logType: LogType;
	startSec: number;
	endSec: number;
	filter: FilterType;
	setProgress?: ProgressCallback;
} ): Promise< DownloadLogsResult > {
	const { siteId, siteSlug, logType, startSec, endSec, filter, setProgress } = args;

	let scrollId: string | null = null;
	const rows: string[] = [];
	let totalAvailable: number | null = null;
	let downloadedCount = 0;
	let pageSize = 500;
	let emptyBatchCount = 0;

	for ( let attempt = 1; attempt <= MAX_DOWNLOAD_RETRIES; attempt++ ) {
		try {
			do {
				let batchAttempt = 0;
				let batch: LogEntry[] = [];

				while ( batchAttempt < MAX_BATCH_RETRIES ) {
					try {
						batchAttempt++;
						const batchResp = await fetchSiteLogsBatch( siteId, {
							logType,
							start: startSec,
							end: endSec,
							filter,
							pageSize,
							scrollId,
						} );

						batch = batchResp.logs ?? [];
						// Set totalAvailable from first batch for progress tracking
						if ( ! totalAvailable ) {
							totalAvailable = batchResp.total_results ?? 0;
						}
						scrollId = batchResp.scroll_id ?? null;

						break;
					} catch ( e: unknown ) {
						const err = e as { status?: number };
						// On server error, reduce page size to try succeeding next batch
						if ( err.status === 500 && pageSize > MIN_PAGE_SIZE ) {
							pageSize = Math.max( Math.floor( pageSize / 2 ), MIN_PAGE_SIZE );
						}
						if ( batchAttempt < MAX_BATCH_RETRIES ) {
							await waitWithBackoff( batchAttempt );
						} else {
							throw e;
						}
					}
				}

				if ( batch.length === 0 ) {
					emptyBatchCount++;
				} else {
					emptyBatchCount = 0;
				}

				if ( emptyBatchCount >= MAX_EMPTY_BATCHES ) {
					scrollId = null;
				}

				if ( rows.length === 0 && batch.length > 0 ) {
					const headers = Object.keys( batch[ 0 ] ).filter( ( k ) => k !== 'atomic_site_id' );
					rows.push( headers.join( ',' ) + '\n' );
				}

				for ( const entry of batch ) {
					const line = Object.entries( entry )
						.filter( ( [ key ] ) => key !== 'atomic_site_id' )
						.map( ( [ , value ] ) => csvEscape( value ) )
						.join( ',' );
					rows.push( line + '\n' );
				}

				downloadedCount += batch.length;
				if ( setProgress && totalAvailable ) {
					setProgress( Math.min( downloadedCount / totalAvailable, 1 ) );
				}

				if ( downloadedCount >= MAX_LOGS_DOWNLOAD ) {
					scrollId = null;
				}
				if ( batch.length === 0 && scrollId ) {
					await waitWithBackoff( batchAttempt );
				}
			} while ( scrollId );

			if ( downloadedCount === 0 ) {
				throw new Error( 'No logs retrieved' );
			}

			if ( totalAvailable && downloadedCount < totalAvailable && attempt < MAX_DOWNLOAD_RETRIES ) {
				await waitWithBackoff( attempt );
				continue; // retry entire attempt
			}

			const blob = new Blob( rows, { type: 'text/csv;charset=utf-8' } );
			const url = window.URL.createObjectURL( blob );
			const fileName = `${ siteSlug }-${ logType }-logs-${ startSec }-${ endSec }.csv`;
			const link = document.createElement( 'a' );
			link.href = url;
			link.setAttribute( 'download', fileName );
			link.click();
			window.URL.revokeObjectURL( url );

			return {
				ok: true,
				message: __( 'Logs downloaded.' ),
				fileName,
				totalAvailable: totalAvailable ?? 0,
				downloadedCount,
			};
		} catch {
			if ( attempt < MAX_DOWNLOAD_RETRIES ) {
				await waitWithBackoff( attempt );
			} else {
				return { ok: false, message: __( 'Could not retrieve logs. Please try again later.' ) };
			}
		}
	}
	return { ok: false, message: __( 'Could not retrieve logs. Please try again later.' ) };
}

export function LogsDownloader( {
	siteId,
	siteSlug,
	logType,
	startSec,
	endSec,
	filter,
	onSuccess,
	onError,
}: {
	siteId: number;
	siteSlug: string;
	logType: LogType;
	startSec: number;
	endSec: number;
	filter: FilterType;
	onSuccess?: ( message: string ) => void;
	onError?: ( message: string ) => void;
} ) {
	const { recordTracksEvent } = useAnalytics();

	const [ status, setStatus ] = useState< 'idle' | 'downloading' | 'complete' | 'error' >( 'idle' );
	const [ progress, setProgress ] = useState( 0 );

	const tracksProps = {
		site_slug: siteSlug,
		site_id: siteId,
		start_time: format( new TZDate( startSec * 1000, 'UTC' ), 'yyyy/MM/dd' ),
		end_time: format( new TZDate( endSec * 1000, 'UTC' ), 'yyyy/MM/dd' ),
		log_type: logType,
	};

	const handleOnClick = async () => {
		setStatus( 'downloading' );
		setProgress( 0 );

		const result = await downloadSiteLogsOnce( {
			siteId,
			siteSlug,
			logType,
			startSec,
			endSec,
			filter,
			setProgress,
		} );
		setStatus( result.ok ? 'complete' : 'error' );
		if ( result.ok ) {
			onSuccess?.( result.message );
			recordTracksEvent( 'calypso_dashboard_site_logs_download_completed', {
				download_filename: result.fileName,
				total_log_records_downloaded: result.totalAvailable ?? result.downloadedCount ?? 0,
				...tracksProps,
			} );
		} else {
			onError?.( result.message );
			recordTracksEvent( 'calypso_dashboard_site_logs_download_error', {
				error_message: result.message,
				...tracksProps,
			} );
		}
		recordTracksEvent( 'calypso_dashboard_site_logs_download_started', tracksProps );
	};

	const isDownloading = status === 'downloading';
	const label = isDownloading ? __( 'Downloading…' ) : __( 'Download logs' );

	return (
		<VStack spacing={ 2 }>
			<HStack spacing={ 2 }>
				<Tooltip
					className={ isDownloading ? 'logs-downloader__tooltip' : undefined }
					text={
						isDownloading
							? sprintf(
									/* translators: %s: percentage value */
									__( '%s%% downloaded' ),
									Math.round( progress * 100 )
							  )
							: label
					}
				>
					<VStack>
						{ isDownloading ? (
							<Spinner
								style={ {
									margin: '6px',
									height: '20px',
									width: '20px',
								} }
							/>
						) : (
							<Button
								aria-label={ label }
								size="compact"
								icon={ download }
								disabled={ isDownloading }
								onClick={ handleOnClick }
							/>
						) }
					</VStack>
				</Tooltip>
				<div aria-live="polite" className="screen-reader-text">
					{ isDownloading && `${ Math.round( progress * 100 ) }% downloaded` }
				</div>
			</HStack>
		</VStack>
	);
}
