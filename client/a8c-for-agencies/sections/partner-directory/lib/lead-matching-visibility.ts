import { isEnabled } from '@automattic/calypso-config';

export const A4A_PARTNER_DIRECTORY_LEAD_MATCHING_FEATURE_FLAG =
	'a4a-partner-directory-lead-matching';

export const A4A_PARTNER_DIRECTORY_LEAD_MATCHING_PILOT_AGENCY_IDS = new Set( [
	234278359, 234036126, 232667176, 232640028, 251102500, 241918237, 235066401, 234595592, 232642471,
	235867057, 234739905,
] );

export const isLeadMatchingPilotAgency = ( agencyId?: number ) =>
	typeof agencyId === 'number' &&
	A4A_PARTNER_DIRECTORY_LEAD_MATCHING_PILOT_AGENCY_IDS.has( agencyId );

export const isLeadMatchingSectionEnabled = () =>
	isEnabled( A4A_PARTNER_DIRECTORY_LEAD_MATCHING_FEATURE_FLAG );

export const isLeadMatchingSectionVisible = () => isLeadMatchingSectionEnabled();
