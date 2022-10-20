import type { RequestCartProduct } from '@automattic/shopping-cart';

export type DomainItem = Partial< RequestCartProduct > & Pick< RequestCartProduct, 'product_slug' >;

export type SignupDomainValues = {
	suggestedDomain?: string;
	siteType?: string;
};

export type PlanCartItem = {
	product_slug: string;
};
