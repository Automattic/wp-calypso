import { TERM_MONTHLY } from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import Paid from 'calypso/components/jetpack/card/jetpack-product-card/display-price/paid';
import { ProductData } from 'calypso/jetpack-cloud/sections/overview/primary/overview-products/jetpack-products';
import { SimpleItemCard } from 'calypso/my-sites/plans/jetpack-plans/product-store/simple-item-card';
import getProductIcon from 'calypso/my-sites/plans/jetpack-plans/product-store/utils/get-product-icon';

interface Props {
	productData: ProductData;
	onMoreAboutClick: ( slug: string ) => void;
}

const ProductItem: React.FC< Props > = ( { productData, onMoreAboutClick } ) => {
	const translate = useTranslate();

	if ( ! productData.data ) {
		return null;
	}

	const productSlug = productData.slug ?? '';

	const displayDescription = (
		<>
			{ productData.description } <br />
			<Button
				className="more-info-link"
				onClick={ () => onMoreAboutClick( productData.data.slug ) }
				plain
			>
				{ translate( 'More about {{productName/}}', {
					components: { productName: <>{ productData.name }</> },
				} ) }
			</Button>
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
		<SimpleItemCard
			isCondensedVersion
			title={ productData.name }
			icon={ displayIcon }
			description={ displayDescription }
			price={ displayPrice }
		/>
	);
};

export default ProductItem;
