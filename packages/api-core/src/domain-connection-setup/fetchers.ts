import { wpcom } from '../wpcom-fetcher';
import type { DomainMappingSetupInfo } from './types';

export function fetchDomainMappingSetupInfo(
	domainName: string,
	siteId: number,
	redirectURL: string
): Promise< DomainMappingSetupInfo > {
	return wpcom.req.get( `/domains/${ domainName }/mapping-setup-info/${ siteId }`, {
		redirect_uri: redirectURL,
	} );
}
