import { DomainStatus, DomainSubtype } from '@automattic/api-core';
import { useMemo } from 'react';
import { userHasFlag } from '../../utils/user';
import type { DomainSummary, Site, User } from '@automattic/api-core';

/**
 * Whether the site's plan lets the user change the primary site address, and
 * which of the site's domains can become it.
 */
export function usePrimaryDomainChange( {
	domains,
	site,
	user,
}: {
	domains: DomainSummary[];
	site: Site;
	user: User;
} ) {
	const primaryWithPlanOnly = userHasFlag( user, 'calypso_allow_nonprimary_domains_without_plan' );
	const isOnFreePlan = site?.plan?.is_free ?? false;
	const canUserSetPrimaryDomainOnThisSite =
		! ( primaryWithPlanOnly && isOnFreePlan ) &&
		( site?.plan?.features?.active.includes( 'set-primary-custom-domain' ) ?? false );
	const currentPrimaryDomain = domains.find( ( domain ) => domain.primary_domain )?.domain;
	const eligibleDomains = useMemo(
		() =>
			domains.filter(
				( domain ) =>
					( domain.subtype.id === DomainSubtype.DOMAIN_REGISTRATION ||
						domain.subtype.id === DomainSubtype.DOMAIN_CONNECTION ||
						domain.subtype.id === DomainSubtype.DEFAULT_ADDRESS ) &&
					domain.can_set_as_primary &&
					! domain.primary_domain &&
					domain.domain_status.id !== DomainStatus.CONNECTION_ERROR
			),
		[ domains ]
	);

	return {
		canUserSetPrimaryDomainOnThisSite,
		canChangePrimaryDomain: canUserSetPrimaryDomainOnThisSite && eligibleDomains.length > 0,
		currentPrimaryDomain,
		eligibleDomains,
	};
}
