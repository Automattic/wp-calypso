import { wpcom } from '../wpcom-fetcher';
import type { SiteDomain } from './types';

export async function setPrimaryDomain( siteId: number, domain: string ): Promise< SiteDomain > {
	return wpcom.req.post( `/sites/${ siteId }/domains/primary`, { domain } );
}
