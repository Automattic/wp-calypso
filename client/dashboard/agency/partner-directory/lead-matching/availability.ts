import { getDetailsFormData } from '../details/use-details-form';
import type { AgencyProfile, AgencyProfileUpdate } from '@automattic/api-core';

/**
 * The full public profile update with only the availability changed: the
 * profile endpoint replaces every field it is sent.
 */
export function getAvailabilityUpdate(
	profile: AgencyProfile | null | undefined,
	isAvailable: boolean
): AgencyProfileUpdate | null {
	const details = getDetailsFormData( profile );
	if ( ! details ) {
		return null;
	}

	return {
		profile_company_name: details.name,
		profile_company_email: details.email,
		profile_company_website: details.website,
		profile_company_bio_description: details.bioDescription,
		profile_company_logo_url: details.logoUrl,
		profile_company_landing_page_url: details.landingPageUrl,
		profile_company_country: details.country,
		profile_listing_is_global: details.isGlobal,
		profile_listing_is_available: isAvailable,
		profile_listing_industries: details.industries,
		profile_listing_languages_spoken: details.languagesSpoken,
		profile_listing_services: details.services,
		profile_listing_products: details.products,
		profile_budget_budget_lower_range: details.budgetLowerRange,
	};
}
