import { isEnabled } from '@automattic/calypso-config';

export const A4A_PARTNER_DIRECTORY_LEAD_MATCHING_FEATURE_FLAG =
	'a4a-partner-directory-lead-matching';

export const A4A_PARTNER_DIRECTORY_LEAD_MATCHING_PILOT_AGENCY_IDS = new Set( [
	232667176, 251102500, 234036126, 234278359, 232640028,
] );

export const isLeadMatchingPilotAgency = ( agencyId?: number ) =>
	typeof agencyId === 'number' &&
	A4A_PARTNER_DIRECTORY_LEAD_MATCHING_PILOT_AGENCY_IDS.has( agencyId );

export const isLeadMatchingSectionEnabled = () =>
	isEnabled( A4A_PARTNER_DIRECTORY_LEAD_MATCHING_FEATURE_FLAG );

export const isLeadMatchingSectionVisible = () => isLeadMatchingSectionEnabled();
