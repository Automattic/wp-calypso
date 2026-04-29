import { wpcom } from '../wpcom-fetcher';
import type { AutomatedTransferStatus } from './types';

export async function fetchSiteAutomatedTransferStatus(
	siteId: number
): Promise< AutomatedTransferStatus > {
	return wpcom.req.get( {
		path: `/sites/${ siteId }/automated-transfers/status`,
		apiVersion: '1',
	} );
}
