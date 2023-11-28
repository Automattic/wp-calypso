import formatCurrency from '@automattic/format-currency';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'calypso/state';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import { getProductsList } from 'calypso/state/products-list/selectors';

import './style.scss';

interface Props {
	product: APIProductFamilyProduct;
	hideDiscount?: boolean;
}

export default function ProductPriceWithDiscount( { product, hideDiscount }: Props ) {
	const translate = useTranslate();

	const userProducts = useSelector( ( state ) => getProductsList( state ) );
	const productCost = product?.amount || 0;

	const isDailyPricing = product.price_interval === 'day';

	const discountInfo: {
		actualCost: string;
		discountedCost: string;
		discountPercentage: number;
	} = {
		actualCost: '',
		discountedCost: formatCurrency( productCost, product.currency ),
		discountPercentage: 0,
	};
	if ( Object.keys( userProducts ).length && product ) {
		const yearlyProduct = Object.values( userProducts ).find(
			( prod ) => prod.product_id === product.product_id
		);
		const monthlyProduct =
			yearlyProduct &&
			Object.values( userProducts ).find(
				( p ) =>
					p.billing_product_slug === yearlyProduct.billing_product_slug &&
					p.product_term === 'month'
			);
		if ( monthlyProduct ) {
			const actualCost = isDailyPricing ? monthlyProduct.cost / 365 : monthlyProduct.cost;
			const discountedCost = actualCost - productCost;
			discountInfo.discountPercentage = ! productCost
				? 100
				: Math.round( ( discountedCost / actualCost ) * 100 );
			discountInfo.actualCost = formatCurrency( actualCost, product.currency );
		}
	}

	return (
		<div>
			<div className="product-price-with-discount__price">
				{ discountInfo.discountedCost }
				{
					// Display discount info only if there is a discount
					discountInfo.discountPercentage > 0 && ! hideDiscount && (
						<>
							<span className="product-price-with-discount__price-discount">
								{ translate( 'Save %(discountPercentage)s%', {
									args: {
										discountPercentage: discountInfo.discountPercentage,
									},
								} ) }
							</span>
							<div>
								<span className="product-price-with-discount__price-old">
									{ discountInfo.actualCost }
								</span>
							</div>
						</>
					)
				}
			</div>
			<div className="product-price-with-discount__price-interval">
				{ isDailyPricing && translate( '/USD per license per day' ) }
				{ product.price_interval === 'month' && translate( '/USD per license per month' ) }
			</div>
		</div>
	);
}
