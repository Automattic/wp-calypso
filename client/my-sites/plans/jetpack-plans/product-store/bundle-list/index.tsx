import { useTranslate } from 'i18n-calypso';
import { FeaturedItemCard } from '../featured-item-card';
import { FeaturesList } from '../features-list';
import { HeroImage } from '../hero-image';
import { useBundlesToDisplay } from '../hooks/use-bundles-to-display';
import { useStoreItemInfo } from '../hooks/use-store-item-info';
import { MostPopular } from '../most-popular';
import { SeeAllFeatures } from '../see-all-features';
import type { BundlesListProps } from '../types';

import './style.scss';

export const BundlesList: React.FC< BundlesListProps > = ( {
	createCheckoutURL,
	duration,
	onClickPurchase,
	onClickMoreInfoFactory,
	siteId,
} ) => {
	const [ popularItems ] = useBundlesToDisplay( { duration, siteId } );
	const translate = useTranslate();

	const {
		getCheckoutURL,
		getCtaLabel,
		getOnClickPurchase,
		isDeprecated,
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

	return (
		<div className="jetpack-product-store__bundles-list">
			<MostPopular heading={ translate( 'Most popular bundles' ) } items={ mostPopularItems } />
			<SeeAllFeatures />
		</div>
	);
};
