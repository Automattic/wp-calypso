import { wpcom } from '../wpcom-fetcher';
import type { DnsResponse } from './types';

export function fetchDomainDns( domainName: string ): Promise< DnsResponse > {
	return wpcom.req.get( {
		path: `/domains/${ domainName }/dns`,
		apiVersion: '1.1',
	} );
}
