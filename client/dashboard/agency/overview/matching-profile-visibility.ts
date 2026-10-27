import {
	getAnsweredRequiredFieldCount,
	getLeadMatchingFormData,
	REQUIRED_LEAD_MATCHING_FIELDS,
} from '../partner-directory/lead-matching/form-data';
import type { AgencyLeadMatchingResponse } from '@automattic/api-core';

export function hasIncompleteSavedMatchingProfile(
	agencyId: number,
	response: AgencyLeadMatchingResponse | undefined
): boolean {
	if (
		! agencyId ||
		! response ||
		response.agency_id !== agencyId ||
		response.lead_matching_profile === undefined ||
		response.sync?.status === 'failed'
	) {
		return false;
	}

	return (
		getAnsweredRequiredFieldCount( getLeadMatchingFormData( response.lead_matching_profile ) ) <
		REQUIRED_LEAD_MATCHING_FIELDS.length
	);
}
