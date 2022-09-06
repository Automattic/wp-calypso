import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { FeaturedItemCard } from '../featured-item-card';
import { FeaturesList } from '../features-list';
import { HeroImage } from '../hero-image';
import { useBundlesToDisplay } from '../hooks/use-bundles-to-display';
import { useStoreItemInfo } from '../hooks/use-store-item-info';
import { MostPopular } from '../most-popular';
import { SeeAllFeatures } from '../see-all-features';
import SimpleProductCard from '../simple-product-card';
import type { BundlesListProps } from '../types';

import './style.scss';

export const BundlesList: React.FC< BundlesListProps > = ( {
	createCheckoutURL,
	duration,
	onClickPurchase,
	onClickMoreInfoFactory,
	siteId,
} ) => {
	const [ popularItems, otherItems ] = useBundlesToDisplay( { duration, siteId } );
	const translate = useTranslate();

	const {
		getCheckoutURL,
		getCtaLabel,
		getOnClickPurchase,
		isDeprecated,
		isIncludedInPlan,
		isIncludedInPlanOrSuperseded,
		isOwned,
		isPlanFeature,
		isSuperseded,
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

		const hideMoreInfoLink = isItemDeprecated || isItemOwned || isItemIncludedInPlanOrSuperseded;

		return (
			<div key={ item.productSlug } className="jetpack-product-store__bundles-list--featured-item">
				<FeaturedItemCard
					checkoutURL={ getCheckoutURL( item ) }
					ctaAsPrimary={ ! ( isItemOwned || isPlanFeature( item ) || isItemSuperseded ) }
					ctaLabel={ ctaLabel }
					hero={ <HeroImage item={ item } /> }
					isCtaDisabled={ isItemOwned && ! isUserPurchaseOwner( item ) }
					isIncludedInPlan={ isItemIncludedInPlanOrSuperseded }
					hideMoreInfoLink={ hideMoreInfoLink }
					isOwned={ isItemOwned }
					item={ item }
					onClickMore={ onClickMoreInfoFactory( item ) }
					onClickPurchase={ getOnClickPurchase( item ) }
					siteId={ siteId }
				/>
				<FeaturesList item={ item } />
			</div>
		);
	} );

	const allItems = useMemo(
		() => [ ...popularItems, ...otherItems ],
		[ otherItems, popularItems ]
	);

	return (
		<div className="jetpack-product-store__bundles-list">
			<MostPopular heading={ translate( 'Most popular bundles' ) } items={ mostPopularItems } />
			<SeeAllFeatures />

			{ /* Show All items only if there is something in otherItems */ }
			{ otherItems.length ? (
				<div className="jetpack-product-store__bundles-list-all">
					<h3 className="jetpack-product-store__products-list-all-header">
						{ translate( 'All bundles' ) }
					</h3>

					<div className="jetpack-product-store__bundles-list-all-grid">
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
			) : null }
		</div>
	);
};
