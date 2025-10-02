import { wpcom } from '../wpcom-fetcher';
import type { AuthCodeCheckResult, DomainInboundTransferStatus } from './types';

export async function fetchDomainInboundTransferStatus(
	domainName: string
): Promise< DomainInboundTransferStatus > {
	return await wpcom.req.get( {
		path: `/domains/${ encodeURIComponent( domainName ) }/inbound-transfer-status`,
	} );
}

export async function checkDomainAuthCode(
	domain: string,
	authCode: string
): Promise< AuthCodeCheckResult > {
	return wpcom.req.get< AuthCodeCheckResult >(
		{
			path: `/domains/${ encodeURIComponent( domain ) }/inbound-transfer-check-auth-code`,
		},
		{
			auth_code: authCode,
		}
	);
}
