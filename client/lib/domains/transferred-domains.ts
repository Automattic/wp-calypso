import { ResponseDomain } from 'calypso/lib/domains/types';
import { type as domainTypes } from './constants';

export function getTransferredInDomains( domains: ResponseDomain[] ) {
	return domains.filter( isTransferredInDomain );
}

export function isTransferredInDomain( domain: ResponseDomain ) {
	return domain.type === domainTypes.TRANSFER;
}
