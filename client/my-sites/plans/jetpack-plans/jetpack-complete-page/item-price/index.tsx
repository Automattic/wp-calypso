import DisplayPrice from 'calypso/components/jetpack/card/jetpack-product-card/display-price';
import { SelectorProduct } from 'calypso/my-sites/plans/jetpack-plans/types';
import useItemPrice from 'calypso/my-sites/plans/jetpack-plans/use-item-price';
import { useSelector } from 'calypso/state';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';

import './style.scss';

interface Props {
	item: SelectorProduct | null;
	siteId: number | null;
}

export const ItemPrice: React.FC< Props > = ( { item, siteId } ) => {
	const {
		originalPrice,
		discountedPrice,
		discountedPriceDuration,
		isFetching: pricesAreFetching,
	} = useItemPrice( siteId, item, item?.monthlyProductSlug || '' );
	const currencyCode = useSelector( getCurrentUserCurrencyCode );

	return (
		item && (
			<div className="item-price__complete">
				<DisplayPrice
					isFree={ item.isFree }
					discountedPriceDuration={ discountedPriceDuration }
					discountedPrice={ discountedPrice }
					discountedPriceFirst
					currencyCode={ item.displayCurrency || currencyCode }
					originalPrice={ originalPrice ?? 0 }
					pricesAreFetching={ pricesAreFetching }
					belowPriceText={ item.belowPriceText }
					billingTerm={ item.displayTerm || item.term }
					productName={ item.displayName }
				/>
			</div>
		)
	);
};
