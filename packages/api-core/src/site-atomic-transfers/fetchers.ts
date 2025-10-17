import { wpcom } from '../wpcom-fetcher';
import type { AtomicTransfer } from './types';

export async function fetchLatestAtomicTransfer( siteId: number ): Promise< AtomicTransfer > {
	return wpcom.req.get( {
		path: `/sites/${ siteId }/atomic/transfers/latest`,
		apiNamespace: 'wpcom/v2',
	} );
}
