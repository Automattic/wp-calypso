import { wpcom } from '../wpcom-fetcher';
import type { Domain } from './types';

export function fetchDomain( domainName: string ): Promise< Domain > {
	return wpcom.req.get( {
		// The trailing slash stops nginx from rejecting `.md` domains as file requests.
		path: `/domain-details/${ domainName }/`,
		apiVersion: '1.2',
	} );
}
