import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { useBundlesToDisplay } from '../hooks/use-bundles-to-display';
import { useProductsToDisplay } from '../hooks/use-products-to-display';
import { getSortedDisplayableProducts } from '../utils/get-sorted-displayable-products';
import { AllItems } from './all-items';
import { MostPopular } from './most-popular';
import type { ProductsListProps } from '../types';

export const ProductsList: React.FC< ProductsListProps > = ( {
	onClickMoreInfoFactory,
	siteId,
	duration,
} ) => {
	const [ popularProducts, otherProducts ] = useProductsToDisplay( { duration, siteId } );
	const [ popularBundles ] = useBundlesToDisplay( { duration, siteId } );
	const translate = useTranslate();

	const allItems = useMemo(
		() => getSortedDisplayableProducts( [ ...popularProducts, ...otherProducts ] ),
		[ popularProducts, otherProducts ]
	);

	return (
		<div className="jetpack-product-store__products-list">
			<MostPopular
				heading={ translate( 'Most popular bundles' ) }
				items={ popularBundles }
				onClickMoreInfoFactory={ onClickMoreInfoFactory }
				siteId={ siteId }
			/>

			<AllItems
				heading={ translate( 'All products' ) }
				items={ allItems }
				onClickMoreInfoFactory={ onClickMoreInfoFactory }
				siteId={ siteId }
			/>
		</div>
	);
};
