import { useTranslate } from 'i18n-calypso';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import productButtonLabel from '../../product-card/product-button-label';
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
	siteId,
} ) => {
	const [ popularItems ] = useBundlesToDisplay( { duration, siteId } );
	const translate = useTranslate();

	const {
		getCheckoutURL,
		getOnClickPurchase,
		isDeprecated,
		isIncludedInPlanOrSuperseded,
		isOwned,
		isPlanFeature,
		isSuperseded,
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
			<div key={ item.productSlug } className="jetpack-product-store__bundles-list--featured-item">
				<FeaturedItemCard
					checkoutURL={ getCheckoutURL( item ) }
					ctaAsPrimary={ ! ( isItemOwned || isPlanFeature( item ) || isItemSuperseded ) }
					ctaLabel={ ctaLabel }
					hero={ <HeroImage item={ item } /> }
					isIncludedInPlan={ isIncludedInPlanOrSuperseded( item ) }
					isOwned={ isItemOwned }
					item={ item }
					onClickMore={ () => {
						recordTracksEvent( 'calypso_product_more_about_product_click', {
							product: item.productSlug,
						} );
						// TODO: Open modal
					} }
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
