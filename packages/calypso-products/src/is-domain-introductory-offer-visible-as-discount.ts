import { ResponseCartProduct } from '@automattic/shopping-cart';
import { isDomainRegistration } from './is-domain-registration';

/**
 * Returns true if the domain introductory offer can be displayed as a discount for the user.
 * Currently, introduction offers for domain products are only used to reflect the higher registration prices for H/L premium domains.
 * @param product
 * @returns boolean whether the introductory offer for that product should show as a discount.
 */
export function isDomainIntroductoryOfferVisibleAsDiscount(
	product: ResponseCartProduct
): boolean {
	return ! isDomainRegistration( product );
}
