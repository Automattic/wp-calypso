import { wpcom } from '../wpcom-fetcher';
import type { WhoisDataEntry } from './types';

export function fetchDomainWhois( domainName: string ): Promise< WhoisDataEntry[] > {
	return wpcom.req.get( {
		path: `/domains/${ domainName }/whois`,
		apiVersion: '1.1',
	} );
}
