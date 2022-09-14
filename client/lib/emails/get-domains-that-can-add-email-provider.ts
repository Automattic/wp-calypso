import { canCurrentUserAddEmail } from 'calypso/lib/domains';
import { hasPaidEmailWithUs } from 'calypso/lib/emails';
import type { ResponseDomain } from 'calypso/lib/domains/types';

/**
 * Select domains that are eligible to add email provider and don't have it yet.
 *
 * @param domains An array domains to filter
 */
export const getDomainsThatCanAddEmailProvider = ( domains: ResponseDomain[] ): ResponseDomain[] =>
	domains.filter(
		( domain ) => ! hasPaidEmailWithUs( domain ) && canCurrentUserAddEmail( domain )
	);
