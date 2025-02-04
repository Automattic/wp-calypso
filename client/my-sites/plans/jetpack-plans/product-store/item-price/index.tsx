import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import DisplayPrice from 'calypso/components/jetpack/card/jetpack-product-card/display-price';
import productTooltip from 'calypso/my-sites/plans/jetpack-plans/product-card/product-tooltip';
import { useSelector } from 'calypso/state';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import useItemPrice from '../../use-item-price';
import { useItemPriceCompact } from '../hooks/use-item-price-compact';
import { ItemPriceProps } from '../types';
import ItemPriceMessage from './item-price-message';
import './style.scss';

export const ItemPrice: React.FC< ItemPriceProps > = ( {
	isIncludedInPlan,
	isOwned,
	isExpired,
	item,
	siteId,
	isMultiSiteIncompatible,
} ) => {
	const { originalPrice, discountedPrice, discountedPriceDuration, isFetching, priceTierList } =
		useItemPrice( siteId, item, item?.monthlyProductSlug || '' );
	const currencyCode = useSelector( getCurrentUserCurrencyCode );
	const translate = useTranslate();
	const { containerRef, isCompact } = useItemPriceCompact();

	if ( isMultiSiteIncompatible ) {
		return (
			<ItemPriceMessage message={ translate( 'Not available for multisite WordPress installs' ) } />
		);
	} else if ( isOwned ) {
		const message = isExpired ? translate( 'Expired' ) : translate( 'Active on your site' );
		return <ItemPriceMessage active error={ isExpired } message={ message } />;
	} else if ( isIncludedInPlan ) {
		return <ItemPriceMessage active message={ translate( 'Part of the current plan' ) } />;
	}

	return (
		<div className={ clsx( 'item-price', { 'is-compact': isCompact } ) } ref={ containerRef }>
			<DisplayPrice
				isFree={ item.isFree }
				isOwned={ isOwned }
				discountedPriceDuration={ discountedPriceDuration }
				discountedPrice={ discountedPrice }
				discountedPriceFirst
				currencyCode={ item.displayCurrency || currencyCode }
				originalPrice={ originalPrice ?? 0 }
				pricesAreFetching={ isFetching }
				belowPriceText={ item.belowPriceText }
				billingTerm={ item.displayTerm || item.term }
				productName={ item.displayName }
				displayPriceText={ item.displayPriceText }
				tooltipText={
					priceTierList.length > 0 && productTooltip( item, priceTierList, currencyCode ?? 'USD' )
				}
			/>
		</div>
	);
};
