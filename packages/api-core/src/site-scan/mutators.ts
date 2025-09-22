import { wpcom } from '../wpcom-fetcher';
import type { SiteScan, ThreatActionOptions } from './types';

export function enqueueSiteScan( siteId: number ): Promise< void > {
	return wpcom.req.post( {
		path: `/sites/${ siteId }/scan/enqueue`,
		apiNamespace: 'wpcom/v2',
	} );
}

export async function updateThreat(
	siteId: number,
	threatId: number,
	options: ThreatActionOptions
): Promise< SiteScan > {
	const queryParams = new URLSearchParams();

	if ( options.ignore ) {
		queryParams.set( 'ignore', 'true' );
	} else if ( options.unignore ) {
		queryParams.set( 'unignore', 'true' );
	} else if ( options.fix ) {
		queryParams.set( 'fix', 'true' );
	}

	return wpcom.req.post( {
		path: `/sites/${ siteId }/alerts/${ threatId }?${ queryParams.toString() }`,
		apiNamespace: 'wpcom/v2',
	} );
}

export async function ignoreThreat( siteId: number, threatId: number ): Promise< SiteScan > {
	return updateThreat( siteId, threatId, { ignore: true } );
}

export async function unignoreThreat( siteId: number, threatId: number ): Promise< SiteScan > {
	return updateThreat( siteId, threatId, { unignore: true } );
}

export async function fixThreat( siteId: number, threatId: number ): Promise< SiteScan > {
	return updateThreat( siteId, threatId, { fix: true } );
}
