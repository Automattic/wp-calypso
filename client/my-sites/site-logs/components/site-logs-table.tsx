import { memo, useMemo } from 'react';
import { SiteLogsData } from 'calypso/data/hosting/use-site-logs-query';

type SiteLogs = SiteLogsData[ 'logs' ];

interface SiteLogsTableProps {
	logs?: SiteLogs;
}

export const SiteLogsTable = memo( function SiteLogsTable( { logs }: SiteLogsTableProps ) {
	const columns = useSiteColumns( logs );

	return (
		<table>
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
							<td key={ column }>{ renderCell( log[ column ] ) }</td>
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

		if ( columns.has( 'date' ) ) {
			columns.delete( 'date' );
			return [ 'date', ...columns ];
		}

		return Array.from( columns );
	}, [ logs ] );
}

function renderCell( value: any ) {
	if ( value === null || value === undefined ) {
		return <span className="site-logs-table__empty-cell">-</span>;
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
