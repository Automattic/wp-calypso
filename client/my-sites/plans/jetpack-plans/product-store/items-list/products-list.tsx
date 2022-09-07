import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { useProductsToDisplay } from '../hooks/use-products-to-display';
import { getSortedDisplayableProducts } from '../utils/get-sorted-displayable-products';
import { AllItems } from './all-items';
import { MostPopular } from './most-popular';
import type { ProductsListProps } from '../types';

export const ProductsList: React.FC< ProductsListProps > = ( {
	createCheckoutURL,
	duration,
	onClickPurchase,
	onClickMoreInfoFactory,
	siteId,
} ) => {
	const [ popularItems, otherItems ] = useProductsToDisplay( { duration, siteId } );
	const translate = useTranslate();

	const allItems = useMemo(
		() => getSortedDisplayableProducts( [ ...popularItems, ...otherItems ] ),
		[ popularItems, otherItems ]
	);

	return (
		<div className="jetpack-product-store__products-list">
			<MostPopular
				createCheckoutURL={ createCheckoutURL }
				duration={ duration }
				heading={ translate( 'Most popular products' ) }
				items={ popularItems }
				onClickMoreInfoFactory={ onClickMoreInfoFactory }
				onClickPurchase={ onClickPurchase }
				siteId={ siteId }
			/>

			<AllItems
				createCheckoutURL={ createCheckoutURL }
				duration={ duration }
				heading={ translate( 'All products' ) }
				items={ allItems }
				onClickMoreInfoFactory={ onClickMoreInfoFactory }
				onClickPurchase={ onClickPurchase }
				siteId={ siteId }
			/>
		</div>
	);
};
