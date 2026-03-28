import { isEnabled } from '@automattic/calypso-config';

export const A4A_PARTNER_DIRECTORY_LEAD_MATCHING_FEATURE_FLAG =
	'a4a-partner-directory-lead-matching';

export const isLeadMatchingSectionEnabled = () =>
	isEnabled( A4A_PARTNER_DIRECTORY_LEAD_MATCHING_FEATURE_FLAG );

export const isLeadMatchingSectionVisible = () => isLeadMatchingSectionEnabled();
