import { wpcom } from '../wpcom-fetcher';
import type { DomainGlueRecord } from './types';

export function fetchDomainGlueRecords( domainName: string ): Promise< DomainGlueRecord[] > {
	return wpcom.req.get( {
		// The trailing slash stops nginx from rejecting `.md` domains as file requests.
		path: `/domains/glue-records/${ domainName }/`,
		apiNamespace: 'wpcom/v2',
	} );
}
