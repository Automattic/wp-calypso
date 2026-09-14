import type { SiteDetails } from '@automattic/data-stores';

export function isSiteEligibleForDIFMPurchase( site: SiteDetails ) {
	return !! (
		site.capabilities?.manage_options &&
		( site.is_wpcom_atomic || ! site.jetpack ) &&
		! site.is_wpcom_staging_site &&
		! site.options?.is_wpforteams_site &&
		! site.options?.is_difm_lite_in_progress
	);
}
