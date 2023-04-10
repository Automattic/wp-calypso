import { SiteLogsData } from 'calypso/data/hosting/use-site-logs-query';
import './style.scss';

interface Props {
	log: SiteLogsData[ 'logs' ][ 0 ];
}

export default function SiteLogsExpandedContent( { log }: Props ) {
	return (
		<div className="site-logs-table__expanded-content">
			{ Object.keys( log ).map( ( key ) => (
				<tr key={ key }>
					<td>
						<strong>{ key }</strong>
					</td>
					<td>
						<div className="site-logs-table__expanded-content-info">
							{ renderCell( key, log[ key ] ) }
						</div>
					</td>
				</tr>
			) ) }
		</div>
	);
}

function renderCell( column: string, value: unknown ) {
	if ( value === null || value === undefined || value === '' ) {
		return '-';
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
