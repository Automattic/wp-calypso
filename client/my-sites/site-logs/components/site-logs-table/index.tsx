import classnames from 'classnames';
import { memo, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { SiteLogsData } from 'calypso/data/hosting/use-site-logs-query';
import getSiteSetting from 'calypso/state/selectors/get-site-setting';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import './style.scss';

type SiteLogs = SiteLogsData[ 'logs' ];

interface SiteLogsTableProps {
	logs?: SiteLogs;
	isLoading?: boolean;
}

export const SiteLogsTable = memo( function SiteLogsTable( {
	logs,
	isLoading,
}: SiteLogsTableProps ) {
	const moment = useLocalizedMoment();
	const columns = useSiteColumns( logs );
	const siteGmtOffset = useSelector( ( state ) => {
		const siteId = getSelectedSiteId( state );
		return ( getSiteSetting( state, siteId ?? 0, 'gmt_offset' ) as number | null ) ?? 0;
	} );

	return (
		<table className={ classnames( 'site-logs-table', { 'is-loading': isLoading } ) }>
			<thead>
				<tr>
					{ columns.map( ( column ) => (
						<th key={ column }>{ column }</th>
					) ) }
				</tr>
			</thead>
			<tbody>
				{ logs?.map( ( log, index ) => (
					// An index key is ok in this case because it's just as unique to the log entry as a
					// time stamp.
					<tr key={ index }>
						{ columns.map( ( column ) => (
							<td key={ column }>{ renderCell( column, log[ column ], moment, siteGmtOffset ) }</td>
						) ) }
					</tr>
				) ) }
			</tbody>
		</table>
	);
} );

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

function renderCell(
	column: string,
	value: unknown,
	moment: ReturnType< typeof useLocalizedMoment >,
	siteGmtOffset: number
) {
	if ( value === null || value === undefined || value === '' ) {
		return <span className="site-logs-table__empty-cell" />;
	}

	if ( ( column === 'date' || column === 'timestamp' ) && typeof value === 'string' ) {
		return moment( value )
			.utcOffset( siteGmtOffset * 60 )
			.format( 'll @ HH:mm:ss.SSS Z' );
	}

	switch ( typeof value ) {
		case 'boolean':
			return value.toString();

		case 'number':
		case 'string':
			return value;

		default:
			JSON.stringify( value );
	}
}
