import { Action, AnyAction } from 'redux';
import { ThunkAction } from 'redux-thunk';
import {
	LicenseFilter,
	LicenseSortDirection,
	LicenseSortField,
} from 'calypso/jetpack-cloud/sections/partner-portal/types';

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

export interface LicenseListContext {
	currentPage: number;
	search: string;
	filter: LicenseFilter;
	sortField: LicenseSortField;
	sortDirection: LicenseSortDirection;
}

export type InvoiceStatus = 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';

/**
 * API schemas.
 */
export enum ToSConsent {
	NotConsented = 'not_consented',
	Consented = 'consented',
}

export interface APIPartnerKey {
	id: number;
	name: string;
	oauth2_token: string;
	disabled_on: string | null;
	has_licenses: boolean;
}

export interface APIPartnerAddress {
	country: string;
	city: string;
	line1: string;
	line2: string;
	postal_code: string;
	state: string;
}

export interface APIPartner {
	id: number;
	slug: string;
	name: string;
	contact_person: string;
	company_website: string;
	address: APIPartnerAddress;
	keys: APIPartnerKey[];
	tos: string;
	partner_type: string;
	has_valid_payment_method: boolean;
}

// The API-returned license object is not quite consistent right now so we only define the properties we actively rely on.
export interface APILicense {
	license_key: string;
	issued_at: string;
	revoked_at: string | null;
}

export interface APIProductFamilyProduct {
	name: string;
	slug: string;
	product_id: number;
	currency: string;
	amount: number;
	price_interval: string;
	family_slug: string;
}

export interface APIProductFamily {
	name: string;
	slug: string;
	products: APIProductFamilyProduct[];
}

export interface APIError {
	status: number;
	code: string | null;
	message: string;
	data?: any;
}

export interface APIInvoices {
	items: APIInvoice[];
	has_more: boolean;
}

export interface APIInvoice {
	id: string;
	number: string;
	due_date: string | null;
	status: InvoiceStatus;
	total: number;
	currency: string;
	invoice_pdf: string;
}

/**
 * Calypso.
 */
export interface Invoices {
	items: Invoice[];
	hasMore: boolean;
}

export interface Invoice {
	id: string;
	number: string;
	dueDate: string | null;
	status: InvoiceStatus;
	total: number;
	currency: string;
	pdfUrl: string;
}

export interface CompanyDetailsPayload {
	name: string;
	contactPerson: string;
	companyWebsite: string;
	city: string;
	line1: string;
	line2: string;
	country: string;
	postalCode: string;
	state: string;
}

export interface PartnerDetailsPayload extends CompanyDetailsPayload {
	tos?: 'consented';
}

/**
 * Store.
 */
export interface PartnerKey {
	id: number;
	name: string;
	oAuth2Token: string;
	disabledOn: string | null;
	hasLicenses: boolean;
}

export interface PartnerAddress {
	country: string;
	city: string;
	line1: string;
	line2: string;
	postal_code: string;
	state: string;
}

export interface Partner {
	id: number;
	slug: string;
	contact_person: string;
	company_website: string;
	name: string;
	address: PartnerAddress;
	keys: PartnerKey[];
	tos: string;
	partner_type: string;
	has_valid_payment_method: boolean;
}

export interface PartnerStore {
	hasFetched: boolean;
	isFetching: boolean;
	isPartnerOAuthTokenLoaded: boolean;
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
	all: number;
}

export interface LicensesStore {
	hasFetched: boolean;
	isFetching: boolean;
	paginated: PaginatedItems< License > | null;
	counts: LicenseCounts;
	hasFetchedLicenseCounts: boolean;
}

export interface ProductsStore {
	selectedProductSlugs: string[];
}

interface CombinedStore {
	partner: PartnerStore;
	licenses: LicensesStore;
	products: ProductsStore;
}

/**
 * Represents the entire Redux store but defines only the parts that the partner portal deals with.
 */
export interface PartnerPortalStore {
	partnerPortal: CombinedStore;
}
