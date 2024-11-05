import { Fragment } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { SiteLogsData } from 'calypso/data/hosting/use-site-logs-query';

import './style.scss';

interface Props {
	log: SiteLogsData[ 'logs' ][ 0 ];
	specifiedLogs: string[];
}

function replaceKey( key: string ) {
	if ( key === 'http_referer' ) {
		return __( 'Referrer' );
	} else if ( key === 'body_bytes_sent' ) {
		return __( 'Body bytes sent' );
	} else if ( key === 'http_host' ) {
		return __( 'HTTP host' );
	} else if ( key === 'timestamp' ) {
		return __( 'Timestamp' );
	} else if ( key === 'cached' ) {
		return __( 'Cached' );
	} else if ( key === 'message' ) {
		return __( 'Message' );
	} else if ( key === 'kind' ) {
		return __( 'Kind' );
	} else if ( key === 'name' ) {
		return __( 'Name' );
	} else if ( key === 'file' ) {
		return __( 'File' );
	} else if ( key === 'line' ) {
		return __( 'Line' );
	}
}

export default function SiteLogsExpandedContent( { log, specifiedLogs }: Props ) {
	return (
		<div className="site-logs-table__expanded-content">
			{ specifiedLogs &&
				specifiedLogs.map( ( key ) => (
					<Fragment key={ key }>
						<div>
							<strong>{ replaceKey( key ) }</strong>
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
