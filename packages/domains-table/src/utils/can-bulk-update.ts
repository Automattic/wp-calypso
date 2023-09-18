import { PartialDomainData } from '@automattic/data-stores';
import { type as domainTypes } from './constants';
import { getDomainType } from './get-domain-type';
import { ResponseDomain } from './types';

export function canBulkUpdate(
	domain: PartialDomainData,
	reponseDomain?: ResponseDomain
): boolean {
	const maintenanceDomain = ( reponseDomain?.tldMaintenanceEndTime || 0 ) > 0;
	if ( domain.wpcom_domain || domain.is_wpcom_staging_domain || maintenanceDomain ) {
		return false;
	}

	return ! (
		[
			domainTypes.SITE_REDIRECT,
			domainTypes.MAPPED,
			domainTypes.WPCOM,
		] as ( typeof domainTypes )[ keyof typeof domainTypes ][]
	 ).includes( getDomainType( domain ) );
}
