export enum LicenseState {
	Detached = 'detached',
	Attached = 'attached',
	Revoked = 'revoked',
}

export enum LicenseFilter {
	NotRevoked = 'not_revoked',
	Detached = 'detached',
	Attached = 'attached',
	Revoked = 'revoked',
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
	selectedSite?: { ID: number; domain: string } | null;
	suggestedProduct?: string;
}
