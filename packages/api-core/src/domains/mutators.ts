import { wpcom } from '../wpcom-fetcher';
import type { BulkDomainsAction } from './types';

export function bulkDomainsAction( { type, ...params }: BulkDomainsAction ) {
	return wpcom.req.post( {
		path: `/domains/bulk-actions/${ type }`,
		apiNamespace: 'wpcom/v2',
		body: params,
	} );
}
