import config from '@automattic/calypso-config';
import debug from 'debug';
import { logToLogstash } from 'calypso/lib/logstash';
import type { SiteId } from 'calypso/types';

const debugLog = debug( 'calypso:data:site-migration' );

function safeLogToLogstash( params: Parameters< typeof logToLogstash >[ 0 ] ): void {
	if ( process.env.NODE_ENV === 'test' ) {
		return;
	}

	try {
		logToLogstash( params );
	} catch ( error ) {
		// Fail silently
	}
}

interface LogParams {
	message: string;
	siteId?: SiteId | null;
	extra?: Parameters< typeof logToLogstash >[ 0 ][ 'extra' ];
}

export const log = ( { message, siteId, extra }: LogParams ) => {
	debugLog( message, siteId );
	safeLogToLogstash( {
		feature: 'calypso_client',
		tags: [ 'site-migration' ],
		message,
		site_id: siteId || undefined,
		extra,
		properties: {
			env: config( 'env_id' ),
		},
	} );
};
