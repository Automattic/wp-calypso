import debug from 'debug';
import { logToLogstash, safeLogToLogstash } from 'calypso/lib/logstash';
import type { SiteId } from 'calypso/types';

const debugLog = debug( 'calypso:data:site-migration' );

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
	} );
};

interface MutationLoggerParams extends LogParams {
	action: string;
}

export const mutationLogger = ( { action, siteId, extra }: MutationLoggerParams ) => {
	return {
		onSuccess: () => {
			log( { message: `${ action } success`, siteId, extra } );
		},
		onError: ( error: unknown ) => {
			log( {
				message: `${ action } error`,
				siteId,
				extra: { error: error instanceof Error ? error.message : 'Failed to perform action' },
			} );
		},
	};
};
