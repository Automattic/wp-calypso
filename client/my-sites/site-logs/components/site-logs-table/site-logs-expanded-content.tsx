import { SiteLogsData } from 'calypso/data/hosting/use-site-logs-query';
import './style.scss';

interface Props {
	log: SiteLogsData[ 'logs' ][ 0 ];
}

export default function SiteLogsExpandedContent( { log }: Props ) {
	return (
		<div className="site-logs-table__expanded-content">
			{ Object.keys( log ).map( ( key ) => (
				<tr key={ `expanded-row-${ key }` }>
					<td>
						<strong>{ key }</strong>
					</td>
					<td>
						<div className="site-logs-table__expanded-content-info">{ log[ key ] || '-' }</div>
					</td>
				</tr>
			) ) }
		</div>
	);
}
