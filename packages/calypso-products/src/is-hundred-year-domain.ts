import { ResponseCartProduct } from '@automattic/shopping-cart';

// Currently, the only way to define if a 100-year domain product is being handled is
// by checking the property in the `extra` field on the cart product.
// Later, if needed, we can add a new product for 100-year domains
// and replace this function usages with one that checks the product type.
export const isHundredYearDomain = ( product: ResponseCartProduct ) =>
	Boolean( product.introductory_offer_terms?.enabled ) &&
	Boolean( product.extra?.is_hundred_year_domain );
