import type { DataStatus } from './constants';
import type {
	DomainSuggestion as DomainSuggestionApi,
	DomainSuggestionQuery,
} from '@automattic/domain-search';

export type DomainName = string;

export type DomainSuggestion = DomainSuggestionApi;
export interface DomainCategory {
	/**
	 * The domain category title
	 */
	title: string;

	/**
	 * The domain category slug
	 */
	slug: string;

	/**
	 * The domain category tier
	 */
	tier: number | null;
}

export interface DomainAvailability {
	/**
	 * The domain name the availability was checked for.
	 */
	domain_name: string;

	/**
	 * The mappability status of the domain.
	 */
	mappable: string;

	/**
	 * The availability status of the domain.
	 */
	status: string;

	/**
	 * Whether the domain supports privacy.
	 */
	supports_privacy: boolean;

	/**
	 * ID of the product
	 */
	product_id?: number;

	/**
	 * The product slug
	 */
	product_slug?: string;

	/**
	 * Rendered cost with currency
	 * @example "€15.00"
	 */
	cost?: string;

	/**
	 * Vendor
	 */
	vendor?: string;

	/**
	 * Whether the domain requires HSTS
	 */
	hsts_required?: boolean;

	/**
	 * Whether the domain requires to show the notice for .gay tld
	 */
	is_dot_gay_notice_required?: boolean;
}

export type TimestampMS = ReturnType< typeof Date.now >;

export type DomainSuggestions = Record< string, DomainSuggestion[] | undefined >;

export interface DomainSuggestionState {
	/**
	 * The state of the DomainSuggestions e.g. pending, failure etc
	 */
	state: DataStatus;

	/**
	 * Domain suggestion data typically returned from the API
	 */
	data: DomainSuggestions;

	/**
	 * Error message
	 */
	errorMessage: string | null;

	/**
	 * Timestamp from last updated attempt
	 */
	lastUpdated: TimestampMS;

	/**
	 * Pending timestamp
	 */
	pendingSince: TimestampMS | undefined;
}

export type DomainAvailabilities = Record< string, DomainAvailability | undefined >;

export type DomainSuggestionSelectorOptions = Partial< Exclude< DomainSuggestionQuery, 'query' > >;
