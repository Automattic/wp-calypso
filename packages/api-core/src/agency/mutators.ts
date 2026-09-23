import { wpcom } from '../wpcom-fetcher';
import type {
	Agency,
	AgencyHostingReferral,
	AgencyHostingReferralResponse,
	AgencyMediaUpload,
	AgencyPartnerDirectoryApplicationUpdate,
	AgencyProfileUpdate,
	AgencyVipPartnerOpportunity,
} from './types';

/**
 * Updates the agency's partner directory application and returns the updated agency.
 */
export async function updateAgencyPartnerDirectoryApplication(
	agencyId: number,
	update: AgencyPartnerDirectoryApplicationUpdate
): Promise< Agency > {
	return wpcom.req.put(
		{
			path: `/agency/${ agencyId }/profile/application`,
			apiNamespace: 'wpcom/v2',
			method: 'PUT',
		},
		update
	);
}

/**
 * Updates the agency's public profile and returns the updated agency.
 */
export async function updateAgencyProfile(
	agencyId: number,
	update: AgencyProfileUpdate
): Promise< Agency > {
	return wpcom.req.put(
		{
			path: `/agency/${ agencyId }/profile`,
			apiNamespace: 'wpcom/v2',
			method: 'PUT',
		},
		update
	);
}

/**
 * Uploads the agency's partner directory logo and returns the stored media.
 */
export async function uploadAgencyPartnerDirectoryLogo(
	agencyId: number,
	file: File
): Promise< AgencyMediaUpload > {
	const formData = new FormData();
	formData.append( 'media', file );
	formData.append( 'asset_type', 'partner_directory_logo' );

	return wpcom.req.post( {
		path: `/agency/${ agencyId }/media`,
		apiNamespace: 'wpcom/v2',
		body: formData,
	} );
}

/**
 * Refers a client to WordPress VIP hosting on behalf of the agency.
 */
export async function submitAgencyVipPartnerOpportunity(
	agencyId: number,
	referral: AgencyVipPartnerOpportunity
): Promise< AgencyHostingReferralResponse > {
	return wpcom.req.post( {
		path: '/agency/vip/partner-opportunity',
		apiNamespace: 'wpcom/v2',
		body: { agency_id: agencyId, ...referral },
	} );
}

/**
 * Refers a client to a Pressable Premium plan on behalf of the agency.
 */
export async function submitAgencyPressablePremiumPlanReferral(
	agencyId: number,
	referral: AgencyHostingReferral
): Promise< AgencyHostingReferralResponse > {
	return wpcom.req.post( {
		path: '/agency/pressable/premium-plan-referral',
		apiNamespace: 'wpcom/v2',
		body: { agency_id: agencyId, ...referral },
	} );
}
