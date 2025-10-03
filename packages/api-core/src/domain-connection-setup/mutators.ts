import { wpcom } from '../wpcom-fetcher';
import type { DomainMappingStatus } from './types';

export function updateConnectionModeAndGetMappingStatus(
	domainName: string,
	connectionMode: string
): Promise< DomainMappingStatus > {
	return wpcom.req.post( `/domains/${ domainName }/mapping-status`, {
		mode: connectionMode,
	} );
}
