/*
 * Partner Directory route paths, shared by the router and the screens that
 * link to them so the two can't drift apart.
 */
export const PARTNER_DIRECTORY_ROUTE = '/agency/partner-directory';

export const PARTNER_DIRECTORY_EXPERTISE_SEGMENT = 'expertise';
export const PARTNER_DIRECTORY_EXPERTISE_ROUTE = `${ PARTNER_DIRECTORY_ROUTE }/${ PARTNER_DIRECTORY_EXPERTISE_SEGMENT }`;

export const PARTNER_DIRECTORY_DETAILS_SEGMENT = 'details';
export const PARTNER_DIRECTORY_DETAILS_ROUTE = `${ PARTNER_DIRECTORY_ROUTE }/${ PARTNER_DIRECTORY_DETAILS_SEGMENT }`;

export const PARTNER_DIRECTORY_LEAD_MATCHING_SEGMENT = 'lead-matching';
export const PARTNER_DIRECTORY_LEAD_MATCHING_ROUTE = `${ PARTNER_DIRECTORY_ROUTE }/${ PARTNER_DIRECTORY_LEAD_MATCHING_SEGMENT }`;

export const getLeadMatchingSectionRoute = ( section: string ) =>
	`${ PARTNER_DIRECTORY_LEAD_MATCHING_ROUTE }/${ section }`;
