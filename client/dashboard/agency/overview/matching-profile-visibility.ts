import {
	getAnsweredRequiredFieldCount,
	getLeadMatchingFormData,
	REQUIRED_LEAD_MATCHING_FIELDS,
} from '../partner-directory/lead-matching/form-data';
import type { AgencyLeadMatchingResponse } from '@automattic/api-core';

export function getAnsweredMatchingProfileCount(
	agencyId: number,
	response: AgencyLeadMatchingResponse | undefined
): number | undefined {
	if (
		! agencyId ||
		! response ||
		response.agency_id !== agencyId ||
		response.lead_matching_profile === undefined ||
		response.sync?.status === 'failed'
	) {
		return undefined;
	}

	return getAnsweredRequiredFieldCount( getLeadMatchingFormData( response.lead_matching_profile ) );
}

export function hasIncompleteSavedMatchingProfile(
	agencyId: number,
	response: AgencyLeadMatchingResponse | undefined
): boolean {
	const answered = getAnsweredMatchingProfileCount( agencyId, response );
	return answered !== undefined && answered < REQUIRED_LEAD_MATCHING_FIELDS.length;
}
