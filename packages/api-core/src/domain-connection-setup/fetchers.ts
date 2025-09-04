import { wpcom } from '../wpcom-fetcher';
import type { DomainSetupInfo } from './types';

export function fetchDomainSetupInfo(
	domainName: string,
	siteId: number,
	redirectURL: string
): Promise< DomainSetupInfo > {
	return wpcom.req.get( `/domains/${ domainName }/mapping-setup-info/${ siteId }`, {
		redirect_uri: redirectURL,
	} );
}
