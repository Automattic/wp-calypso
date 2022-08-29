import { useSelector } from 'react-redux';
import DisplayPrice from 'calypso/components/jetpack/card/jetpack-product-card/display-price';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import useItemPrice from '../use-item-price';
import { ItemPriceProps } from './types';

export const ItemPrice: React.FC< ItemPriceProps > = ( { item, siteId } ) => {
	const { originalPrice, discountedPrice, isFetching } = useItemPrice(
		siteId,
		item,
		item?.monthlyProductSlug || ''
	);
	const currencyCode = useSelector( getCurrentUserCurrencyCode );

	return (
		<DisplayPrice
			isFree={ item.isFree }
			discountedPrice={ discountedPrice }
			discountedPriceFirst
			currencyCode={ item.displayCurrency || currencyCode }
			originalPrice={ originalPrice ?? 0 }
			pricesAreFetching={ isFetching }
			belowPriceText={ item.belowPriceText }
			billingTerm={ item.displayTerm || item.term }
			productName={ item.displayName }
		/>
	);
};
