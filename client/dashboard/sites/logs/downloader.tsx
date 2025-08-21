import {
	Button,
	Tooltip,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { download } from '@wordpress/icons';
import { fetchSiteLogsBatch } from '../../data/site-logs';
import type { LogType, FilterType } from '../../data/site-logs';

const MAX_LOGS_DOWNLOAD = 10_000;

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
} ): Promise< { ok: boolean; message: string } > {
	const { siteId, siteSlug, logType, startSec, endSec, filter } = args;

	let scrollId: string | null = null;
	const rows: string[] = [];
	let isError = false;

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
	const filename = `${ siteSlug }-${ logType }-logs-${ startSec }-${ endSec }.csv`;
	link.href = url;
	link.setAttribute( 'download', filename );
	link.click();
	window.URL.revokeObjectURL( url );

	return { ok: true, message: __( 'Logs downloaded.' ) };
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
	const [ status, setStatus ] = useState< 'idle' | 'downloading' | 'complete' | 'error' >( 'idle' );

	const disabled = status === 'downloading';
	const label = status === 'downloading' ? __( 'Downloading…' ) : __( 'Download logs' );
	const [ isHovered, setIsHovered ] = useState( false );

	let iconColor = 'inherit';
	if ( status === 'downloading' ) {
		iconColor = 'gray';
	} else if ( isHovered ) {
		iconColor = 'var(--color-link, var(--color-accent, #3858e9))';
	}

	return (
		<VStack spacing={ 2 }>
			<HStack spacing={ 2 }>
				<Tooltip text={ label }>
					<Button
						variant="tertiary"
						aria-label={ label }
						size="compact"
						icon={ download }
						style={ { color: iconColor } }
						disabled={ disabled }
						onMouseEnter={ () => setIsHovered( true ) }
						onMouseLeave={ () => setIsHovered( false ) }
						onClick={ async () => {
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
							} else {
								onError?.( result.message );
							}
						} }
					/>
				</Tooltip>
			</HStack>
		</VStack>
	);
}
