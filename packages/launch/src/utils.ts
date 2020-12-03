/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';

import type { Plans, DomainSuggestions } from '@automattic/data-stores';

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

type PlanProduct = {
	product_id: number;
	product_slug: string;
	extra: {
		source: string;
	};
};

export const getPlanProduct = ( plan: Plans.Plan, flow: string ): PlanProduct => ( {
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

export type Product = {
	product_id: number;
};

export const isDomainProduct = ( item: Product ): boolean => {
	const DOMAIN_PRODUCT_ID = 148;
	return item.product_id === DOMAIN_PRODUCT_ID;
};
