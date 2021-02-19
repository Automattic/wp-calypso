/**
 * External dependencies
 */
import { AnyAction } from 'redux';

/**
 * Utility.
 */
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
	oauth2_token: string;
	disabled_on: string | null;
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
	error: string;
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

export interface LicensesStore {
	hasFetched: boolean;
	isFetching: boolean;
	paginated: PaginatedItems< License > | null;
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
