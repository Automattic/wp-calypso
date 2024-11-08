import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import { memo, useMemo } from 'react';
import { SiteLogsData } from 'calypso/data/hosting/use-site-logs-query';
import { useCurrentSiteGmtOffset } from '../../hooks/use-current-site-gmt-offset';
import { LogType } from '../site-logs';
import SiteLogsTableRow from './site-logs-table-row';
import { Skeleton } from './skeleton';
import './style.scss';

type SiteLogs = SiteLogsData[ 'logs' ];

interface SiteLogsTableProps {
	logs?: SiteLogs;
	logType?: LogType;
	latestLogType?: LogType | null;
	isLoading?: boolean;
	headerTitles: string[];
}

export const SiteLogsTable = memo( function SiteLogsTable( {
	logs,
	isLoading,
	headerTitles,
	logType,
	latestLogType,
}: SiteLogsTableProps ) {
	const { __ } = useI18n();
	const columns = useSiteColumns( logs, headerTitles );
	const siteGmtOffset = useCurrentSiteGmtOffset();

	const logsWithKeys = useMemo( () => {
		return generateRowKeys( logs );
	}, [ logs ] );

	if ( isLoading && logType !== latestLogType ) {
		const skeletonClassName =
			logType === 'web' ? 'site-logs-table-webserver__skeleton' : 'site-logs-table__skeleton';

		return <Skeleton className={ skeletonClassName } />;
	}

	if ( ! isLoading && ! logsWithKeys.length ) {
		return <>{ __( 'No log entries within this time range.' ) }</>;
	}

	const siteGsmOffsetDisplay =
		siteGmtOffset === 0 ? 'UTC' : `UTC${ siteGmtOffset > 0 ? '+' : '' }${ siteGmtOffset }`;

	const columnNames: { [ key in string ]: string } = {
		request_type: __( 'Request type' ),
		request_url: __( 'Request URL' ),
		// translators: %s is the timezone offset of the site, e.g. GMT, GMT +1, GMT -1.
		date: sprintf( __( 'Date & time (%s)' ), siteGsmOffsetDisplay ),
		status: __( 'Status' ),
		severity: __( 'Severity' ),
		// translators: %s is the timezone offset of the site, e.g. GMT, GMT +1, GMT -1.
		timestamp: sprintf( __( 'Date & time (%s)' ), siteGsmOffsetDisplay ),
		message: __( 'Message' ),
	};

	function formatColumnName( column: string ) {
		return columnNames[ column ] || column;
	}

	return (
		<table className={ clsx( 'site-logs-table', { 'is-loading': isLoading } ) }>
			<thead>
				<tr>
					{ columns.map( ( column ) => (
						<th key={ column } className={ column }>
							{ formatColumnName( column ) }
						</th>
					) ) }
					<th className="chevron-cell" />
				</tr>
			</thead>
			<tbody>
				{ logsWithKeys.map( ( [ log, key ] ) => (
					<SiteLogsTableRow
						key={ key }
						columns={ columns }
						log={ log }
						logType={ logType }
						siteGmtOffset={ siteGmtOffset }
					/>
				) ) }
			</tbody>
		</table>
	);
} );

/**
 * Generates a unique key for each row in the table. The timestamp alone isn't unique enough (the
 * PHP logs have a resolution of 1 second, so multiple entries can have the same timestamp), so we
 * also include the order the logs appear as part of the key.
 *
 * If we're unlucky there's a chance that logs with the same timestamp appear across multiple fetches,
 * in which case our keys will be wrong. But this is the best I think we can come up with without
 * the logging API returning a proper ID for each log entry.
 */
function generateRowKeys( logs: SiteLogs = [] ): [ SiteLogs[ 0 ], React.Key ][] {
	let previousKey: React.Key;
	let count = 0;
	return logs.map( ( log, index ) => {
		const key = generateRowKey( log, index );
		if ( previousKey !== key ) {
			count = 0;
		}
		count++;
		previousKey = key;
		return [ log, `${ key }${ count }` ];
	} );
}

function generateRowKey( log: SiteLogs[ 0 ], index: number ): React.Key {
	if ( typeof log[ 'date' ] === 'string' || typeof log[ 'date' ] === 'number' ) {
		return log[ 'date' ];
	}
	if ( typeof log[ 'timestamp' ] === 'string' || typeof log[ 'timestamp' ] === 'number' ) {
		return log[ 'timestamp' ];
	}

	// We don't recognise this log format, but we need to fallback to something.
	return index;
}

function useSiteColumns( logs: SiteLogs | undefined, headerTitles: string[] ) {
	return useMemo( () => {
		if ( ! logs ) {
			return [];
		}

		return headerTitles;
	}, [ logs, headerTitles ] );
}
