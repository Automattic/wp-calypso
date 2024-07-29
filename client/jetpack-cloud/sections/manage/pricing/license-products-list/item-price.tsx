import { TERM_MONTHLY } from '@automattic/calypso-products';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import DisplayPrice from 'calypso/components/jetpack/card/jetpack-product-card/display-price';
import getProductShortTitle from 'calypso/jetpack-cloud/sections/partner-portal/lib/get-product-short-title';
import { getProductPricingInfo } from 'calypso/jetpack-cloud/sections/partner-portal/primary/issue-license/lib/pricing';
import { useItemPriceCompact } from 'calypso/my-sites/plans/jetpack-plans/product-store/hooks/use-item-price-compact';
import { useSelector } from 'calypso/state';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import { getProductsList } from 'calypso/state/products-list/selectors';
import 'calypso/my-sites/plans/jetpack-plans/product-store/item-price/style.scss';
import './style.scss';

type ItemPriceProps = {
	item: APIProductFamilyProduct;
	bundleSize?: number;
};

export const ItemPrice = ( { item, bundleSize }: ItemPriceProps ) => {
	const userProducts = useSelector( getProductsList );
	const originalPrice = parseFloat( item.amount );
	const { discountedCost } = getProductPricingInfo(
		userProducts,
		item,
		bundleSize ? bundleSize : 1
	);

	bundleSize = bundleSize ? bundleSize : 1;
	const nonDiscountedCost = originalPrice * bundleSize;
	const discountPercent = Math.round( 100 - ( discountedCost / nonDiscountedCost ) * 100 );
	const currencyCode = useSelector( getCurrentUserCurrencyCode );
	const translate = useTranslate();
	const { containerRef, isCompact } = useItemPriceCompact();

	const customTimeFrameSavings = bundleSize > 1 && (
		<span className="product-license-price-with-discount__price-discount">
			{ translate( 'Save %(discountPercent)s%', {
				args: {
					discountPercent,
				},
			} ) }
		</span>
	);

	const customTimeFrameBillingTerms = (
		<span className="product-license-price-with-discount__price-interval">
			{ bundleSize > 1
				? translate( ' per bundle per month' )
				: translate( ' per license per month' ) }
		</span>
	);

	const title = getProductShortTitle( item, false );

	return (
		<div className={ clsx( 'item-price', { 'is-compact': isCompact } ) } ref={ containerRef }>
			<DisplayPrice
				isFree={ false }
				isOwned={ false }
				discountedPrice={ discountedCost }
				hideSavingLabel={ false }
				currencyCode={ item.currency || currencyCode }
				originalPrice={ nonDiscountedCost ?? 0 }
				pricesAreFetching={ false }
				billingTerm={ TERM_MONTHLY }
				productName={ title }
				customTimeFrameSavings={ customTimeFrameSavings }
				customTimeFrameBillingTerms={ customTimeFrameBillingTerms }
			/>
		</div>
	);
};
