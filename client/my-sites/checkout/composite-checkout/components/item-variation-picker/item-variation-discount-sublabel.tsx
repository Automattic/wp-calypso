import { Theme } from '@automattic/composite-checkout';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { useGetProductVariants } from '../../hooks/product-variants';
import { getDiscountPercentageBetweenVariants } from './variant-price';
import type { ResponseCartProduct } from '@automattic/shopping-cart';

const LineItemMeta = styled.div< { theme?: Theme } >`
	color: ${ ( props ) => props.theme.colors.textColorLight };
	font-size: 14px;
	width: 100%;
	display: flex;
	flex-direction: row;
	align-content: center;
	justify-content: space-between;
	flex-wrap: wrap;
	gap: 2px 10px;
`;

export function ItemVariationDiscountSublabel( {
	product,
	siteId,
}: {
	product: ResponseCartProduct;
	siteId: number | undefined;
} ) {
	const variants = useGetProductVariants( siteId, product.product_slug );
	const translate = useTranslate();
	const variantForProduct = variants.find(
		( variant ) => variant.productId === product.product_id
	);
	if ( ! variantForProduct ) {
		return null;
	}
	const compareTo = variants[ 0 ];
	const discountPercentage = getDiscountPercentageBetweenVariants( variantForProduct, compareTo );

	if ( discountPercentage < 1 ) {
		return null;
	}
	if ( variantForProduct.termIntervalInMonths === 12 ) {
		return (
			<LineItemMeta>
				{ translate( 'Annual discount: %(discountPercentage)d%%', {
					args: { discountPercentage },
				} ) }
			</LineItemMeta>
		);
	}
	if ( variantForProduct.termIntervalInMonths === 24 ) {
		return (
			<LineItemMeta>
				{ translate( 'Biennial discount: %(discountPercentage)d%%', {
					args: { discountPercentage },
				} ) }
			</LineItemMeta>
		);
	}
	return null;
}
