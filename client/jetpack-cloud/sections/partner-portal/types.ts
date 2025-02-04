import type { SiteDetails } from '@automattic/data-stores';

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
	Standard = 'standard',
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

export enum LicenseType {
	Standard = 'user',
	Partner = 'jetpack_partner_key',
}

export enum LicenseRole {
	Parent = 'parent',
	Child = 'child',
	Single = 'single',
}

export interface AssignLicenceProps {
	selectedSite?: SiteDetails | null;
	suggestedProduct?: string;
	quantity?: number;
}

export interface LicenseAction {
	name: string;
	isEnabled: boolean;
	href?: string;
	onClick: () => void;
	type?: string;
	isExternalLink?: boolean;
	className?: string;
}

export interface SetAsPrimaryCardProps {
	paymentMethodId: string;
	useAsPrimaryPaymentMethod: boolean;
}
