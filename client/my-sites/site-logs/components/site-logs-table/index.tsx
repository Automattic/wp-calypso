import { usePrevious } from '@wordpress/compose';
import { useI18n } from '@wordpress/react-i18n';
import classnames from 'classnames';
import { memo, useMemo } from 'react';
import { SiteLogsData } from 'calypso/data/hosting/use-site-logs-query';
import { useCurrentSiteGmtOffset } from '../../hooks/use-current-site-gmt-offset';
import SiteLogsTableRow from './site-logs-table-row';
import { Skeleton } from './skeleton';

import './style.scss';

type SiteLogs = SiteLogsData[ 'logs' ];

interface SiteLogsTableProps {
	logs?: SiteLogs;
	logType?: string;
	isLoading?: boolean;
}

export const SiteLogsTable = memo( function SiteLogsTable( {
	logs,
	logType,
	isLoading,
}: SiteLogsTableProps ) {
	const { __ } = useI18n();
	const columns = useSiteColumns( logs );
	const siteGmtOffset = useCurrentSiteGmtOffset();
	const previousLogType = usePrevious( logType );

	const logsWithKeys = useMemo( () => {
		return generateRowKeys( logs );
	}, [ logs ] );

	if ( isLoading && logType !== previousLogType ) {
		return <Skeleton />;
	}

	if ( ! isLoading && ! logsWithKeys.length ) {
		return <>{ __( 'No log entries within this time range.' ) }</>;
	}

	return (
		<table className={ classnames( 'site-logs-table', { 'is-loading': isLoading } ) }>
			<thead>
				<tr>
					<th />
					{ columns.map( ( column ) => (
						<th key={ column }>{ column }</th>
					) ) }
				</tr>
			</thead>
			<tbody>
				{ logsWithKeys.map( ( [ log, key ] ) => (
					<SiteLogsTableRow
						key={ key }
						columns={ columns }
						log={ log }
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

function useSiteColumns( logs: SiteLogs | undefined ) {
	return useMemo( () => {
		if ( ! logs ) {
			return [];
		}

		const columns = new Set< string >();
		for ( const log of logs ) {
			for ( const key of Object.keys( log ) ) {
				columns.add( key );
			}
		}

		// The webserver logs have both `date` and `timestamp` columns and we want date to take
		// precedence, so check for presence of `date` column first.
		if ( columns.has( 'date' ) ) {
			columns.delete( 'date' );
			return [ 'date', ...columns ];
		}

		if ( columns.has( 'timestamp' ) ) {
			columns.delete( 'timestamp' );
			return [ 'timestamp', ...columns ];
		}

		return Array.from( columns );
	}, [ logs ] );
}
