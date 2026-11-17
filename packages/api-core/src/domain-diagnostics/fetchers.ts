import { wpcom } from '../wpcom-fetcher';
import type { DomainDiagnostics } from './types';

export function fetchDomainDiagnostics( domainName: string ): Promise< DomainDiagnostics > {
	return wpcom.req.get( {
		// The trailing slash stops nginx from rejecting `.md` domains as file requests.
		path: `/domains/diagnostics/${ domainName }/`,
		apiNamespace: 'wpcom/v2',
	} );
}
