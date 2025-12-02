import { wpcom } from '../wpcom-fetcher';
import type { DomainForwarding } from './types';

export function fetchDomainForwarding( domainName: string ): Promise< DomainForwarding[] > {
	return wpcom.req.get( `/sites/all/domain/${ domainName }/redirects`, { 'new-endpoint': 'true' } );
}
