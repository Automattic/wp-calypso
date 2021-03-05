/**
 * External dependencies
 */
import { Action, AnyAction } from 'redux';
import { ThunkAction } from 'redux-thunk';

/**
 * Utility.
 */
export interface DispatchRequest {
	( options: unknown ): unknown;
}

export type PartnerPortalThunkAction< A extends Action = AnyAction, R = unknown > = ThunkAction<
	void,
	PartnerPortalStore,
	R,
	A
>;

export interface HttpAction extends AnyAction {
	fetcher: string;
}

export interface PaginatedItems< T > {
	currentItems: number;
	currentPage: number;
	items: T[];
	itemsPerPage: number;
	totalItems: number;
	totalPages: number;
}

export interface APIError {
	status: number;
	code: string | null;
	message: string;
}

/**
 * Store.
 */
export interface PartnerKey {
	id: number;
	name: string;
	oAuth2Token: string;
	disabledOn: string | null;
}

export interface Partner {
	id: number;
	slug: string;
	name: string;
	keys: PartnerKey[];
}

export interface PartnerStore {
	hasFetched: boolean;
	isFetching: boolean;
	activePartnerKey: number;
	current: Partner | null;
	error: APIError | null;
}

export interface License {
	licenseId: number;
	licenseKey: string;
	productId: number;
	product: string;
	userId: number | null;
	username: string | null;
	blogId: number | null;
	siteUrl: string | null;
	issuedAt: string;
	attachedAt: string | null;
	revokedAt: string | null;
}

export interface LicenseCounts {
	attached: number;
	detached: number;
	revoked: number;
	not_revoked: number;
}

export interface LicensesStore {
	hasFetched: boolean;
	isFetching: boolean;
	paginated: PaginatedItems< License > | null;
	counts: LicenseCounts;
}

interface CombinedStore {
	partner: PartnerStore;
	licenses: LicensesStore;
}

/**
 * Represents the entire Redux store but defines only the parts that the partner portal deals with.
 */
export interface PartnerPortalStore {
	partnerPortal: CombinedStore;
}
