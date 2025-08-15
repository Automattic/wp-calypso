import { Domain } from '../../data/domain';

/**
 * Hook to determine if the upsell nudge should be shown for a domain
 * @param domain The domain to check
 * @returns boolean indicating if the upsell nudge should be shown
 */
export const useUpsellNudge = ( domain: Domain ): boolean => {
	if (
		! domain.points_to_wpcom ||
		domain.wpcom_domain ||
		domain.primary_domain ||
		domain.is_domain_only_site ||
		domain.is_wpcom_staging_domain
	) {
		return false;
	}

	return true;
};
