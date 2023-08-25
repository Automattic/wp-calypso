import { Fragment } from '@wordpress/element';
import { SiteLogsData } from 'calypso/data/hosting/use-site-logs-query';

import './style.scss';

interface Props {
	log: SiteLogsData[ 'logs' ][ 0 ];
	specifiedLogs: string[];
}

export default function SiteLogsExpandedContent( { log, specifiedLogs }: Props ) {
	return (
		<div className="site-logs-table__expanded-content">
			{ specifiedLogs &&
				specifiedLogs.map( ( key ) => (
					<Fragment key={ key }>
						<div>
							<strong>{ key }</strong>
						</div>
						<div>
							<div className="site-logs-table__expanded-content-info">
								{ renderCell( key, log[ key ] ) }
							</div>
						</div>
					</Fragment>
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
