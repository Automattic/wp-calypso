/**
 * External dependencies
 */
import type { ResponseCartProduct } from '@automattic/shopping-cart';
import { Plans as PlansStore } from '@automattic/data-stores';
import type { DomainSuggestions, Plans } from '@automattic/data-stores';

export type PlanProductForFlow = {
	product_id: number;
	product_slug: string;
	extra: {
		source: string;
	};
};

export const getPlanProductForFlow = (
	plan: PlansStore.PlanProduct,
	flow: string
): PlanProductForFlow => ( {
	product_id: plan.productId,
	product_slug: plan.storeSlug,
	extra: {
		source: flow,
	},
} );

export type DomainProduct = {
	meta: string;
	product_id: number;
	extra: {
		privacy_available?: boolean;
		privacy?: boolean;
		source: string;
	};
	product_cost_display: string;
	currency_code?: string;
	product_slug?: string;
	cost: number;
	currency: string;
};

export const getDomainProduct = (
	domain: DomainSuggestions.DomainSuggestion,
	flow: string
): DomainProduct | undefined => {
	if ( domain.unavailable ) {
		return;
	}
	if ( ! domain?.product_id ) {
		return;
	}
	return {
		meta: domain?.domain_name,
		product_id: domain?.product_id,
		extra: {
			privacy_available: domain?.supports_privacy,
			privacy: domain?.supports_privacy,
			source: flow,
		},
		product_cost_display: domain.cost,
		currency_code: domain.currency_code,
		product_slug: domain.product_slug,
		cost: domain.raw_price,
		currency: domain.currency_code,
	};
};

export const isDomainProduct = ( item: ResponseCartProduct ): boolean => {
	return !! item.is_domain_registration;
};

export const isPlanProduct = ( item: ResponseCartProduct ): boolean => {
	return PlansStore.plansProductSlugs.indexOf( item.product_slug as Plans.StorePlanSlug ) > -1;
};
