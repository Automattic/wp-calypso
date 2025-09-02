import { wpcom } from '../wpcom-fetcher';
import type { DomainForwardingSaveData } from './types';

export function deleteDomainForwarding(
	domainName: string,
	forwardingId: number
): Promise< void > {
	return wpcom.req.post( `/sites/all/domain/${ domainName }/redirects/delete`, {
		domain_redirect_id: forwardingId,
	} );
}

export function saveDomainForwarding(
	domainName: string,
	data: DomainForwardingSaveData
): Promise< void > {
	return wpcom.req.post( `/sites/all/domain/${ domainName }/redirects`, data );
}
