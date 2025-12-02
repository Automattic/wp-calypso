import { wpcom } from '../wpcom-fetcher';
import type { DNSSECResponse } from './types';

export async function updateDNSSEC( domain: string, enabled: boolean ): Promise< DNSSECResponse > {
	return wpcom.req.post( {
		path: `/domains/dnssec/${ domain }`,
		apiNamespace: 'wpcom/v2',
		...( ! enabled && { method: 'DELETE' } ),
	} );
}
