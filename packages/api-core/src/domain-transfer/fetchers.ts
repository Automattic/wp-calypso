import { wpcom } from '../wpcom-fetcher';
import type { DomainInboundTransferStatus } from './types';

export async function fetchDomainInboundTransferStatus(
	domainName: string
): Promise< DomainInboundTransferStatus > {
	return await wpcom.req.get( {
		path: `/domains/${ encodeURIComponent( domainName ) }/inbound-transfer-status`,
		apiVersion: '1.1',
	} );
}
