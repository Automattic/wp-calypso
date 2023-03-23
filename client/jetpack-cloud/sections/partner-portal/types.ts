import type { SiteDetails } from '@automattic/data-stores';

export enum LicenseState {
	Detached = 'detached',
	Attached = 'attached',
	Revoked = 'revoked',
	Legacy = 'legacy',
}

export enum LicenseFilter {
	NotRevoked = 'not_revoked',
	Detached = 'detached',
	Attached = 'attached',
	Revoked = 'revoked',
	Legacy = 'legacy',
}

export enum LicenseSortField {
	IssuedAt = 'issued_at',
	AttachedAt = 'attached_at',
	RevokedAt = 'revoked_at',
}

export enum LicenseSortDirection {
	Ascending = 'asc',
	Descending = 'desc',
}

export interface AssignLicenceProps {
	selectedSite?: SiteDetails | null;
	suggestedProduct?: string;
}

export type LicenseOwnerType = 'jetpack_partner_key' | 'user';
