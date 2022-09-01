import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import productButtonLabel from '../product-card/product-button-label';
import { FeaturedItemCard } from './featured-item-card';
import { HeroImage } from './hero-image';
import { useProductsToDisplay } from './hooks/use-products-to-display';
import { useStoreItemInfo } from './hooks/use-store-item-info';
import { MostPopular } from './most-popular';
import SimpleProductCard from './simple-product-card';
import { getSortedDisplayableProducts } from './utils/get-sorted-displayable-products';
import type { ProductsListProps } from './types';

export const ProductsList: React.FC< ProductsListProps > = ( {
	createCheckoutURL,
	duration,
	onClickPurchase,
	siteId,
} ) => {
	const [ popularItems, otherItems ] = useProductsToDisplay( { duration, siteId } );
	const translate = useTranslate();

	const {
		getCheckoutURL,
		getOnClickPurchase,
		isIncludedInPlanOrSuperseded,
		isOwned,
		isPlanFeature,
		isSuperseded,
		isDeprecated,
		isUpgradeableToYearly,
		sitePlan,
	} = useStoreItemInfo( {
		createCheckoutURL,
		onClickPurchase,
		duration,
		siteId,
	} );

	const mostPopularItems = popularItems.map( ( item ) => {
		const isItemOwned = isOwned( item );
		const isItemSuperseded = isSuperseded( item );

		const ctaLabel = productButtonLabel( {
			product: item,
			isOwned: isItemOwned,
			isUpgradeableToYearly: isUpgradeableToYearly( item ),
			isDeprecated: isDeprecated( item ),
			isSuperseded: isItemSuperseded,
			currentPlan: sitePlan,
			fallbackLabel: translate( 'Get' ),
		} );

		return (
			<FeaturedItemCard
				checkoutURL={ getCheckoutURL( item ) }
				ctaAsPrimary={ ! ( isItemOwned || isPlanFeature( item ) || isItemSuperseded ) }
				ctaLabel={ ctaLabel }
				hero={ <HeroImage item={ item } /> }
				isIncludedInPlan={ isIncludedInPlanOrSuperseded( item ) }
				isOwned={ isItemOwned }
				item={ item }
				key={ item.productSlug }
				onClickMore={ () => {
					recordTracksEvent( 'calypso_product_more_about_product_click', {
						product: item.productSlug,
					} );
					// TODO: Open modal
				} }
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
				<h3>{ translate( 'All products' ) }</h3>

				<div className="jetpack-product-store__products-list-all-grid">
					{ allItems.map( ( item ) => {
						const isItemOwned = isOwned( item );
						const isItemSuperseded = isSuperseded( item );

						const ctaLabel = productButtonLabel( {
							product: item,
							isOwned: isItemOwned,
							isUpgradeableToYearly: isUpgradeableToYearly( item ),
							isDeprecated: isDeprecated( item ),
							isSuperseded: isItemSuperseded,
							currentPlan: sitePlan,
							fallbackLabel: translate( 'Get' ),
						} );
						return (
							<SimpleProductCard
								checkoutURL={ getCheckoutURL( item ) }
								ctaAsPrimary={ ! ( isItemOwned || isPlanFeature( item ) || isItemSuperseded ) }
								ctaLabel={ ctaLabel }
								isIncludedInPlan={ isIncludedInPlanOrSuperseded( item ) }
								isOwned={ isItemOwned }
								item={ item }
								key={ item.productSlug }
								onClickMore={ () => {
									recordTracksEvent( 'calypso_product_more_about_product_click', {
										product: item.productSlug,
									} );
									// TODO: Open modal
								} }
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
