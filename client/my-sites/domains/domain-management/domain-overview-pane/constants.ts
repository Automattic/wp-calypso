export const DOMAIN_OVERVIEW = 'domain-overview';
export const EMAIL_MANAGEMENT = 'email-management';

export const FEATURE_TO_ROUTE_MAP: { [ feature: string ]: string } = {
	[ DOMAIN_OVERVIEW ]: 'domains/manage/all/overview/:domain/:site',
	[ EMAIL_MANAGEMENT ]: 'domains/manage/all/email/:domain/:site',
};
