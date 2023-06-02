import { ProductListItem } from 'calypso/state/products-list/selectors/get-products-list';

const hasIntroductoryOffer = ( product: ProductListItem | null ) => {
	return Boolean( product?.introductory_offer ?? false );
};

export { hasIntroductoryOffer };
