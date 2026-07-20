import type { MigrationCommissionSite } from '@automattic/api-core';

const COMMISSION_INCENTIVE_STATUSES = [
	'pending',
	'verified',
	'paid',
	'rejected',
	'reverification',
	'ineligible',
] as const;

/**
 * Keeps only the sites that carry a known migration incentive status. The list
 * endpoint returns every agency site, so this narrows it to the ones relevant
 * to the commissions view.
 */
export function selectCommissionSites(
	sites: MigrationCommissionSite[]
): MigrationCommissionSite[] {
	return sites.filter( ( site ) =>
		COMMISSION_INCENTIVE_STATUSES.some( ( status ) => status === site.incentive_status )
	);
}
