import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import DisplayPrice from 'calypso/components/jetpack/card/jetpack-product-card/display-price';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import useItemPrice from '../../use-item-price';
import { ItemPriceProps } from '../types';

import './style.scss';

export const ItemPrice: React.FC< ItemPriceProps > = ( {
	isIncludedInPlan,
	isOwned,
	item,
	siteId,
} ) => {
	const { originalPrice, discountedPrice, isFetching } = useItemPrice(
		siteId,
		item,
		item?.monthlyProductSlug || ''
	);
	const currencyCode = useSelector( getCurrentUserCurrencyCode );
	const translate = useTranslate();

	if ( isOwned || isIncludedInPlan ) {
		return (
			<div className="item-price__is-owned">
				<span className="item-price__is-owned--dot"></span>
				<span className="item-price__is-owned--text">
					{ isOwned ? translate( 'Active on your site' ) : translate( 'Part of the current plan' ) }
				</span>
			</div>
		);
	}

	return (
		<div className="item-price">
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
