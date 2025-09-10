import { LogType, fetchSiteLogsBatch } from '@automattic/api-core';
import { TZDate } from '@automattic/ui';
import {
	Button,
	Tooltip,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { download } from '@wordpress/icons';
import { format } from 'date-fns';
import { useAnalytics } from '../../app/analytics';
import type { FilterType } from '@automattic/api-core';

const MAX_LOGS_DOWNLOAD = 10_000;

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

function csvEscape( value: unknown ): string {
	const str = value == null ? '' : String( value );
	const needsQuotes = /[",\n]/.test( str );
	const escaped = str.replace( /"/g, '""' );
	return needsQuotes ? `"${ escaped }"` : escaped;
}

async function downloadSiteLogs( args: {
	siteId: number;
	siteSlug: string;
	logType: LogType;
	startSec: number;
	endSec: number;
	filter: FilterType;
} ): Promise< DownloadLogsResult > {
	const { siteId, siteSlug, logType, startSec, endSec, filter } = args;

	// Activity logs don't support batch downloads yet
	if ( LogType.ACTIVITY ) {
		return {
			ok: false,
			message: __( 'Activity log downloads are not yet supported.' ),
		};
	}

	let scrollId: string | null = null;
	const rows: string[] = [];
	let isError = false;
	let totalAvailable: number | null = null;
	let downloadedCount = 0;

	do {
		try {
			const batchResp = await fetchSiteLogsBatch( siteId, {
				logType,
				start: startSec,
				end: endSec,
				filter,
				pageSize: 500,
				scrollId,
			} );
			const batch = batchResp.logs;
			if ( totalAvailable === null ) {
				totalAvailable = batchResp.total_results ?? 0;
			}
			scrollId = batchResp.scroll_id;
			if ( rows.length === 0 ) {
				if ( batch.length === 0 ) {
					isError = true;
					break;
				}
				const headerKeys = Object.keys( batch[ 0 ] ).filter(
					( fieldName ) => fieldName !== 'atomic_site_id'
				);
				rows.push( headerKeys.join( ',' ) + '\n' );
			}
			for ( const entry of batch ) {
				const cleaned = Object.entries( entry )
					.filter( ( [ key ] ) => key !== 'atomic_site_id' )
					.map( ( [ , value ] ) => csvEscape( value ) );
				rows.push( cleaned.join( ',' ) + '\n' );
			}
			downloadedCount += batch.length;
			if ( rows.length > MAX_LOGS_DOWNLOAD ) {
				scrollId = null;
			}
		} catch ( e ) {
			isError = true;
		}
	} while ( scrollId );

	if ( isError ) {
		return {
			ok: false,
			message: __( 'Could not retrieve logs. Please try again in a few minutes.' ),
		};
	}

	const blob = new Blob( rows, { type: 'text/csv;charset=utf-8' } );
	const url = window.URL.createObjectURL( blob );
	const link = document.createElement( 'a' );
	const fileName = `${ siteSlug }-${ logType }-logs-${ startSec }-${ endSec }.csv`;
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

	const tracksProps = {
		site_slug: siteSlug,
		site_id: siteId,
		start_time: format( new TZDate( startSec * 1000, 'UTC' ), 'yyyy/MM/dd' ),
		end_time: format( new TZDate( endSec * 1000, 'UTC' ), 'yyyy/MM/dd' ),
		log_type: logType,
	};

	const handleOnClick = async () => {
		setStatus( 'downloading' );
		const result = await downloadSiteLogs( {
			siteId,
			siteSlug,
			logType,
			startSec,
			endSec,
			filter,
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

	const disabled = status === 'downloading';
	const label = disabled ? __( 'Downloading…' ) : __( 'Download logs' );

	return (
		<VStack spacing={ 2 }>
			<HStack spacing={ 2 }>
				<Tooltip text={ label }>
					<Button
						aria-label={ label }
						size="compact"
						icon={ download }
						disabled={ disabled }
						onClick={ handleOnClick }
					/>
				</Tooltip>
			</HStack>
		</VStack>
	);
}
