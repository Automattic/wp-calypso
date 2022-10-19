import { hasIntroductoryOffer } from 'calypso/lib/emails/has-introductory-offer';
import { ProductListItem } from 'calypso/state/products-list/selectors/get-products-list';

const hasIntroductoryOfferFreeTrial = ( product: ProductListItem | null ) => {
	return hasIntroductoryOffer( product ) && product?.introductory_offer?.cost_per_interval === 0;
};

export { hasIntroductoryOfferFreeTrial };
