import { PartialDomainData } from '@automattic/data-stores';
import { type as domainTypes } from './constants';
import { getDomainType } from './get-domain-type';

export function canBulkUpdate( domain: PartialDomainData ): boolean {
	const maintenanceDomain = domain.tld_maintenance_end_time > 0;
	if ( domain.wpcom_domain || domain.is_wpcom_staging_domain || maintenanceDomain ) {
		return false;
	}

	return ! (
		[
			domainTypes.SITE_REDIRECT,
			domainTypes.MAPPED,
			domainTypes.WPCOM,
			domainTypes.TRANSFER,
		] as ( typeof domainTypes )[ keyof typeof domainTypes ][]
	 ).includes( getDomainType( domain ) );
}
