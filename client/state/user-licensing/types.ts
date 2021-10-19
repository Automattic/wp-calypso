import { Action, AnyAction } from 'redux';
import { ThunkAction } from 'redux-thunk';

export interface LicenseCounts {
	attached: number;
	detached: number;
	revoked: number;
	not_revoked: number;
}

export interface PaginatedItems< T > {
	currentItems: number;
	currentPage: number;
	items: T[];
	itemsPerPage: number;
	totalItems: number;
	totalPages: number;
}

export interface License {
	licenseId: number;
	licenseKey: string;
	productId: number;
	product: string;
	userId: number | null;
	username: string | null;
	blogId: number | null;
	siteurl: string | null;
	issuedAt: string;
	attachedAt: string | null;
	revokedAt: string | null;
}

export interface LicensesStore {
	licensesFetching: boolean;
	countsFetching: boolean;
	licenses: PaginatedItems< License > | null;
	counts: LicenseCounts | null;
	hasFetchedLicenseCounts: boolean;
}

export interface UserLicensingStore {
	userLicensing: LicensesStore;
}

export type UserLicensingThunkAction< A extends Action = AnyAction, R = unknown > = ThunkAction<
	void,
	UserLicensingStore,
	R,
	A
>;
