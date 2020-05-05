/**
 * Internal dependencies
 */
import type { GSuiteProductUser } from 'lib/gsuite/new-users';

export type CartItemValue = {
	product_id?: number;
	product_name?: string;
	product_slug?: string;
	meta?: string;
	cost?: number;
	orig_cost?: number | null;
	currency?: string;
	volume?: number;
	free_trial?: boolean;
	is_domain_registration?: boolean;
	extra?: CartItemExtra;
};

export type CartItemExtra = {
	context?: string;
	source?: string;
	domain_to_bundle?: string;
	google_apps_users?: GSuiteProductUser[];
	purchaseId?: string;
	purchaseDomain?: string;
	purchaseType?: string;
	includedDomain?: string;
	privacy?: boolean;
};

export type CartValue = {
	blog_id: number;
	products: CartItemValue[];
	total_cost?: number;
	temporary?: boolean;
	currency?: string;
	coupon?: string;
	bundled_domain?: string;
	is_coupon_applied?: boolean;
	has_bundle_credit?: boolean;
	next_domain_is_free?: boolean;
	next_domain_condition?: string;
	messages?: {
		errors?: string[];
		success?: string[];
	};
	client_metadata?: ClientMetadata;
};

export type ClientMetadata = {
	lastServerResponseDate: string;
};
