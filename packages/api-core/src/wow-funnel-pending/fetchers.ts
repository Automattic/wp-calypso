import { wpcom } from '../wpcom-fetcher';
import type { WowFunnelPending } from './types';

export async function fetchWowFunnelPending(): Promise< WowFunnelPending > {
	return wpcom.req.get( {
		path: '/wow-funnel/pending',
		apiNamespace: 'wpcom/v2',
	} );
}
