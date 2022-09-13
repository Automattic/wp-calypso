import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import DisplayPrice from 'calypso/components/jetpack/card/jetpack-product-card/display-price';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import useItemPrice from '../../use-item-price';
import { useItemPriceCompact } from '../hooks/use-item-price-compact';
import { ItemPriceProps } from '../types';
import ItemPriceMessage from './item-price-message';
import './style.scss';

export const ItemPrice: React.FC< ItemPriceProps > = ( {
	isIncludedInPlan,
	isOwned,
	item,
	siteId,
	isMultiSiteIncompatible,
} ) => {
	const { originalPrice, discountedPrice, isFetching } = useItemPrice(
		siteId,
		item,
		item?.monthlyProductSlug || ''
	);
	const currencyCode = useSelector( getCurrentUserCurrencyCode );
	const translate = useTranslate();
	const { containerRef, isCompact } = useItemPriceCompact();

	if ( isMultiSiteIncompatible ) {
		return (
			<ItemPriceMessage message={ translate( 'Not available for multisite WordPress installs' ) } />
		);
	} else if ( isOwned ) {
		return <ItemPriceMessage message={ translate( 'Active on your site' ) } />;
	} else if ( isIncludedInPlan ) {
		return <ItemPriceMessage message={ translate( 'Part of the current plan' ) } />;
	}

	return (
		<div className={ classNames( 'item-price', { 'is-compact': isCompact } ) } ref={ containerRef }>
			<DisplayPrice
				isFree={ item.isFree }
				isOwned={ isOwned }
				discountedPrice={ discountedPrice }
				discountedPriceFirst
				currencyCode={ item.displayCurrency || currencyCode }
				originalPrice={ originalPrice ?? 0 }
				pricesAreFetching={ isFetching }
				belowPriceText={ item.belowPriceText }
				billingTerm={ item.displayTerm || item.term }
				productName={ item.displayName }
			/>
		</div>
	);
};
