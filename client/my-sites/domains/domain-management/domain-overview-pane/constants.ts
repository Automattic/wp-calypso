export const DOMAIN_OVERVIEW = 'domain-overview';
export const EMAIL_MANAGEMENT = 'email-management';

export const FEATURE_TO_ROUTE_MAP: { [ feature: string ]: string } = {
	[ DOMAIN_OVERVIEW ]: 'domains/manage/all/overview/:domain/:site',
	[ EMAIL_MANAGEMENT ]: 'domains/manage/all/email/:domain/:site',
};

export const FEATURE_TO_ROUTE_MAP_IN_SITE_CONTEXT: { [ feature: string ]: string } = {
	[ DOMAIN_OVERVIEW ]: 'overview/site-domain/domain/:domain/:site',
	[ EMAIL_MANAGEMENT ]: 'overview/site-domain/email/:domain/:site',
};
