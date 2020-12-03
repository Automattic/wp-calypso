/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';

import type { Plans, DomainSuggestions } from '@automattic/data-stores';

const DEFAULT_SITE_NAME = __( 'Site Title', __i18n_text_domain__ );

export const isDefaultSiteTitle = ( {
	currentSiteTitle = '',
}: {
	currentSiteTitle: string | undefined;
} ): boolean => currentSiteTitle === DEFAULT_SITE_NAME;

export const isValidSiteTitle = ( title?: string ): boolean =>
	title !== '' && ! isDefaultSiteTitle( { currentSiteTitle: title } );

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
	is_domain_registration: true;
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
	is_domain_registration: true,
	extra: {
		privacy_available: domain?.supports_privacy,
		privacy: domain?.supports_privacy,
		source: flow,
	},
} );

export type Product = {
	product_id: number;
	is_domain_registration?: boolean;
};

export const isDomainProduct = ( item: Product ): boolean => {
	return !! item.is_domain_registration;
};
