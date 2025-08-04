import type { Site } from '../data/types';

export function wasBusinessTrial( site: Site ) {
	return site.was_migration_trial || site.was_hosting_trial;
}

export function wasEcommerceTrial( site: Site ) {
	return site.was_ecommerce_trial === true;
}

export function hasSiteTrialEnded( site: Site ) {
	return (
		( wasBusinessTrial( site ) || wasEcommerceTrial( site ) ) &&
		! site.was_upgraded_from_trial &&
		// The trial plan may have expired but can remain the current plan of the site for a short period before it's replaced by the free plan.
		( site.plan?.expired || site.plan?.is_free )
	);
}
