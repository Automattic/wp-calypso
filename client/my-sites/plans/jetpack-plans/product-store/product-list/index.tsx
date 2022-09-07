import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { FeaturedItemCard } from '../featured-item-card';
import { HeroImage } from '../hero-image';
import { useProductsToDisplay } from '../hooks/use-products-to-display';
import { useStoreItemInfo } from '../hooks/use-store-item-info';
import { MostPopular } from '../most-popular';
import SimpleProductCard from '../simple-product-card';
import { getSortedDisplayableProducts } from '../utils/get-sorted-displayable-products';
import type { ProductsListProps } from '../types';

import './style.scss';

export const ProductsList: React.FC< ProductsListProps > = ( {
	createCheckoutURL,
	duration,
	onClickPurchase,
	onClickMoreInfoFactory,
	siteId,
} ) => {
	const [ popularItems, otherItems ] = useProductsToDisplay( { duration, siteId } );
	const translate = useTranslate();

	const {
		getCheckoutURL,
		getCtaLabel,
		getOnClickPurchase,
		isIncludedInPlan,
		isIncludedInPlanOrSuperseded,
		isOwned,
		isPlanFeature,
		isSuperseded,
		isDeprecated,
		isUserPurchaseOwner,
	} = useStoreItemInfo( {
		createCheckoutURL,
		onClickPurchase,
		duration,
		siteId,
	} );

	const mostPopularItems = popularItems.map( ( item ) => {
		const isItemOwned = isOwned( item );
		const isItemSuperseded = isSuperseded( item );
		const isItemDeprecated = isDeprecated( item );
		const isItemIncludedInPlanOrSuperseded = isIncludedInPlanOrSuperseded( item );

		const ctaLabel = getCtaLabel( item );

		const isCtaDisabled =
			( isItemOwned || isIncludedInPlan( item ) ) && ! isUserPurchaseOwner( item );

		const hideMoreInfoLink = isItemDeprecated || isItemOwned || isItemIncludedInPlanOrSuperseded;

		return (
			<FeaturedItemCard
				checkoutURL={ getCheckoutURL( item ) }
				ctaAsPrimary={ ! ( isItemOwned || isPlanFeature( item ) || isItemSuperseded ) }
				ctaLabel={ ctaLabel }
				hero={ <HeroImage item={ item } /> }
				hideMoreInfoLink={ hideMoreInfoLink }
				isCtaDisabled={ isCtaDisabled }
				isIncludedInPlan={ isItemIncludedInPlanOrSuperseded }
				isOwned={ isItemOwned }
				item={ item }
				key={ item.productSlug }
				onClickMore={ onClickMoreInfoFactory( item ) }
				onClickPurchase={ getOnClickPurchase( item ) }
				siteId={ siteId }
			/>
		);
	} );

	const allItems = useMemo(
		() => getSortedDisplayableProducts( [ ...popularItems, ...otherItems ] ),
		[ popularItems, otherItems ]
	);

	return (
		<div className="jetpack-product-store__products-list">
			<MostPopular heading={ translate( 'Most popular products' ) } items={ mostPopularItems } />

			<div className="jetpack-product-store__products-list-all">
				<h3 className="jetpack-product-store__products-list-all-header">
					{ translate( 'All products' ) }
				</h3>

				<div className="jetpack-product-store__products-list-all-grid">
					{ allItems.map( ( item ) => {
						const isItemOwned = isOwned( item );
						const isItemSuperseded = isSuperseded( item );
						const isItemDeprecated = isDeprecated( item );
						const isItemIncludedInPlanOrSuperseded = isIncludedInPlanOrSuperseded( item );

						const isCtaDisabled =
							( isItemOwned || isIncludedInPlan( item ) ) && ! isUserPurchaseOwner( item );

						const ctaLabel = getCtaLabel( item );

						const hideMoreInfoLink =
							isItemDeprecated || isItemOwned || isItemIncludedInPlanOrSuperseded;

						return (
							<SimpleProductCard
								checkoutURL={ getCheckoutURL( item ) }
								ctaAsPrimary={ ! ( isItemOwned || isPlanFeature( item ) || isItemSuperseded ) }
								ctaLabel={ ctaLabel }
								isCtaDisabled={ isCtaDisabled }
								isIncludedInPlan={ isItemIncludedInPlanOrSuperseded }
								hideMoreInfoLink={ hideMoreInfoLink }
								isOwned={ isItemOwned }
								item={ item }
								key={ item.productSlug }
								onClickMore={ onClickMoreInfoFactory( item ) }
								onClickPurchase={ getOnClickPurchase( item ) }
								siteId={ siteId }
							/>
						);
					} ) }
				</div>
			</div>
		</div>
	);
};
