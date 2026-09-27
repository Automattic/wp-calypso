import type { ReferHostingFormData } from './types';
import type { AgencyHostingReferral, AgencyVipPartnerOpportunity } from '@automattic/api-core';

export function getHostingReferralPayload( data: ReferHostingFormData ): AgencyHostingReferral {
	return {
		company_name: data.companyName,
		address: data.address,
		country_code: data.country,
		state: data.state,
		city: data.city,
		zip: data.zip,
		first_name: data.firstName,
		last_name: data.lastName,
		title: data.title,
		phone: data.phone,
		email: data.email,
		website: data.website,
		opportunity_description: data.opportunityDescription,
	};
}

export function getVipPartnerOpportunityPayload(
	data: ReferHostingFormData
): AgencyVipPartnerOpportunity {
	return {
		...getHostingReferralPayload( data ),
		lead_type: data.leadType,
		is_rfp: data.isRfp === 'yes',
	};
}
