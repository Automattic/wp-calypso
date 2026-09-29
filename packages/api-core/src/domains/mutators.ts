import { wpcom } from '../wpcom-fetcher';
import type { BulkDomainsAction } from './types';

export function bulkDomainsAction( { type, ...params }: BulkDomainsAction ) {
	return wpcom.req.post( {
		path: `/domains/bulk-actions/${ type }`,
		apiNamespace: 'wpcom/v2',
		body: params,
	} );
}

export function setWwwPrimaryDomain( domain: string, enabled: boolean ) {
	return wpcom.req.post( {
		path: `/domains/www-primary/${ domain }`,
		apiNamespace: 'wpcom/v2',
		body: { enabled },
	} );
}
