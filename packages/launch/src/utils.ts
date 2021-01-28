/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import type { DomainSuggestions } from '@automattic/data-stores';
import type { ResponseCartProduct } from '@automattic/shopping-cart';
import { Plans as PlansStore } from '@automattic/data-stores';
import type { Plans } from '@automattic/data-stores';

const DEFAULT_SITE_NAME = __( 'Site Title', __i18n_text_domain__ );

export const isDefaultSiteTitle = ( {
	currentSiteTitle = '',
}: {
	currentSiteTitle: string | undefined;
} ): boolean => currentSiteTitle === DEFAULT_SITE_NAME;

export const isValidSiteTitle = ( title?: string ): boolean =>
	title !== '' && ! isDefaultSiteTitle( { currentSiteTitle: title } );

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
		privacy_available: boolean;
		privacy: boolean;
		source: string;
	};
};

export const getDomainProduct = (
	domain: DomainSuggestions.DomainSuggestion,
	flow: string
): DomainProduct => ( {
	meta: domain?.domain_name,
	product_id: domain?.product_id,
	extra: {
		privacy_available: domain?.supports_privacy,
		privacy: domain?.supports_privacy,
		source: flow,
	},
} );

export const isDomainProduct = ( item: ResponseCartProduct ): boolean => {
	return !! item.is_domain_registration;
};

export const isPlanProduct = ( item: ResponseCartProduct ): boolean => {
	return PlansStore.plansProductSlugs.indexOf( item.product_slug as Plans.StorePlanSlug ) > -1;
};
