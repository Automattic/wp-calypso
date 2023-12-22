import { TERM_MONTHLY } from '@automattic/calypso-products';
import Paid from 'calypso/components/jetpack/card/jetpack-product-card/display-price/paid';
import { ProductData } from 'calypso/jetpack-cloud/sections/overview/primary/overview-products/jetpack-products';
import { MoreInfoLink } from 'calypso/my-sites/plans/jetpack-plans/product-store/more-info-link';
import { SimpleItemCard } from 'calypso/my-sites/plans/jetpack-plans/product-store/simple-item-card';
import getProductIcon from 'calypso/my-sites/plans/jetpack-plans/product-store/utils/get-product-icon';
import { SelectorProduct } from 'calypso/my-sites/plans/jetpack-plans/types';

interface Props {
	productData: ProductData;
	productSlug: string;
	onMoreAboutClick: ( slug: string ) => void;
}

const ProductItem: React.FC< Props > = ( { productData, productSlug, onMoreAboutClick } ) => {
	const itemData: SelectorProduct = {
		moreAboutUrl: productData.url,
		shortName: <>{ productData.name }</>,
		productSlug: productSlug,
	};

	const displayDescription = (
		<>
			{ productData.description } <br />
			<MoreInfoLink
				onClick={ () => onMoreAboutClick( productData.data.slug ) }
				item={ itemData }
				isLinkExternal={ true }
				withIcon={ false }
			/>
		</>
	);

	const displayIcon = (
		<img
			alt={ productData.name + ' icon' }
			src={ getProductIcon( { productSlug: productSlug } ) }
		/>
	);

	const displayPrice = (
		<Paid
			billingTerm={ TERM_MONTHLY }
			originalPrice={ productData.data.amount }
			currencyCode={ productData.data.currency }
		/>
	);

	return (
		<li key={ productData.data.product_id }>
			<SimpleItemCard
				isCondensedVersion={ true }
				title={ productData.name }
				icon={ displayIcon }
				description={ displayDescription }
				price={ displayPrice }
			/>
		</li>
	);
};

export default ProductItem;
