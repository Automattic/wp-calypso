/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { Plans as PlansStore } from '@automattic/data-stores';

import type { Plans, DomainSuggestions } from '@automattic/data-stores';
import type { ResponseCartProduct } from '@automattic/shopping-cart';

const DEFAULT_SITE_NAME = __( 'Site Title', __i18n_text_domain__ );

// When `exact === false', the check is more relaxed — chances are that if the title
// matches (even it not exactly) the default title, the user would like want
// to change it before launch.
export const isDefaultSiteTitle = ( {
	currentSiteTitle = '',
	exact = false,
}: {
	currentSiteTitle: string | undefined;
	exact?: boolean;
} ): boolean =>
	exact
		? currentSiteTitle === DEFAULT_SITE_NAME
		: new RegExp( DEFAULT_SITE_NAME, 'i' ).test( currentSiteTitle );

export const getPlanProduct = (
	plan: Plans.Plan,
	flow: string
): Partial< ResponseCartProduct > => ( {
	product_id: plan.productId,
	product_slug: plan.storeSlug,
	extra: {
		source: flow,
	},
} );

export const getDomainProduct = (
	domain: DomainSuggestions.DomainSuggestion,
	flow: string
): Partial< ResponseCartProduct > => ( {
	meta: domain?.domain_name,
	product_id: domain?.product_id,
	extra: {
		privacy_available: domain?.supports_privacy,
		privacy: domain?.supports_privacy,
		source: flow,
	},
} );

export const isDomainProduct = ( item: ResponseCartProduct ): boolean => {
	const DOMAIN_PRODUCT_ID = 148;
	return item.product_id === DOMAIN_PRODUCT_ID;
};

export const isPlanProduct = ( item: ResponseCartProduct ): boolean => {
	return (
		[
			PlansStore.PLAN_FREE,
			PlansStore.PLAN_PERSONAL,
			PlansStore.PLAN_PREMIUM,
			PlansStore.PLAN_BUSINESS,
			PlansStore.PLAN_ECOMMERCE,
		].indexOf( item.product_slug ) > -1
	);
};
