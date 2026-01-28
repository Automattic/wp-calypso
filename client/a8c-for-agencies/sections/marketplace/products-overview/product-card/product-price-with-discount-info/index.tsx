import { isEnabled } from '@automattic/calypso-config';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import TextPlaceholder from 'calypso/a8c-for-agencies/components/text-placeholder';
import withMarketplaceProviders from 'calypso/a8c-for-agencies/sections/marketplace/hoc/with-marketplace-providers';
import { useGetProductPricingInfo } from 'calypso/a8c-for-agencies/sections/marketplace/hooks/use-marketplace';
import { useSelector } from 'calypso/state';
import { isProductsListFetching, getProductsList } from 'calypso/state/products-list/selectors';
import type { TermPricingType } from 'calypso/a8c-for-agencies/sections/marketplace/types';
import type { APIProductFamilyProduct } from 'calypso/a8c-for-agencies/types/products';

import './style.scss';

interface Props {
	termPricing?: TermPricingType;
	product: APIProductFamilyProduct;
	hideDiscount?: boolean;
	quantity?: number;
	compact?: boolean;
}

function ProductPriceWithDiscount( {
	termPricing,
	product,
	hideDiscount,
	quantity = 1,
	compact,
}: Props ) {
	const translate = useTranslate();

	const userProducts = useSelector( getProductsList );
	const isFetching = useSelector( isProductsListFetching );
	const isDailyPricing = product.price_interval === 'day';

	const isBundle = quantity > 1;

	const { getProductPricingInfo, termPricingPriceInfo } = useGetProductPricingInfo(
		termPricing,
		product.currency
	);

	const { discountedCostFormatted, actualCostFormatted, discountPercentage, isFree } =
		getProductPricingInfo( userProducts, product, quantity );

	const { priceInterval: termPriceInterval } = termPricingPriceInfo( product );

	const isTermPricingEnabled = isEnabled( 'a4a-bd-term-pricing' ) && isEnabled( 'a4a-bd-checkout' );

	if ( isFree ) {
		return (
			<div className={ clsx( 'product-price-with-discount__price', { 'is-compact': compact } ) }>
				{ isFetching ? (
					<TextPlaceholder />
				) : (
					<p className="product-price-with-discount__free">{ translate( 'Free' ) }</p>
				) }
			</div>
		);
	}

	const priceInterval = () => {
		if ( isTermPricingEnabled ) {
			return termPriceInterval;
		}
		if ( isDailyPricing ) {
			return isBundle ? translate( 'per bundle per day' ) : translate( 'per license per day' );
		}
		if ( product.price_interval === 'month' ) {
			return isBundle ? translate( 'per bundle per month' ) : translate( 'per license per month' );
		}
		return '';
	};

	return (
		<div>
			<div className={ clsx( 'product-price-with-discount__price', { 'is-compact': compact } ) }>
				{ discountedCostFormatted }
				{
					// Display discount info only if there is a discount
					discountPercentage > 0 && ! hideDiscount && (
						<>
							{ compact && (
								<span className="product-price-with-discount__price-old">
									{ actualCostFormatted }
								</span>
							) }

							<span className="product-price-with-discount__price-discount">
								{ translate( 'Save %(discountPercentage)s%%', {
									args: {
										discountPercentage,
									},
								} ) }
							</span>

							{ ! compact && (
								<div>
									<span className="product-price-with-discount__price-old">
										{ actualCostFormatted }
									</span>
								</div>
							) }
						</>
					)
				}
			</div>
			<div className="product-price-with-discount__price-interval">{ priceInterval() }</div>
		</div>
	);
}

export default withMarketplaceProviders( ProductPriceWithDiscount );
