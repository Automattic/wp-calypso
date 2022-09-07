import classNames from 'classnames';
import { FeaturedItemCard } from '../featured-item-card';
import { FeaturesList } from '../features-list';
import { HeroImage } from '../hero-image';
import { MostPopularProps } from '../types';

import './style-most-popular.scss';

export const MostPopular: React.FC< MostPopularProps > = ( {
	className,
	heading,
	items,
	onClickMoreInfoFactory,
	storeItemInfo,
	siteId,
} ) => {
	const wrapperClassName = classNames( 'jetpack-product-store__most-popular', className );

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
	} = storeItemInfo;

	return (
		<div className={ wrapperClassName }>
			<h3 className="jetpack-product-store__most-popular--heading">{ heading }</h3>
			<div className="jetpack-product-store__most-popular--items">
				{ items.map( ( item ) => {
					const isItemOwned = isOwned( item );
					const isItemSuperseded = isSuperseded( item );
					const isItemDeprecated = isDeprecated( item );
					const isItemIncludedInPlanOrSuperseded = isIncludedInPlanOrSuperseded( item );

					const ctaLabel = getCtaLabel( item );

					const isCtaDisabled =
						( isItemOwned || isIncludedInPlan( item ) ) && ! isUserPurchaseOwner( item );

					const hideMoreInfoLink =
						isItemDeprecated || isItemOwned || isItemIncludedInPlanOrSuperseded;

					return (
						<div key={ item.productSlug } className="jetpack-product-store__most-popular--item">
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
							<FeaturesList item={ item } />
						</div>
					);
				} ) }
			</div>
		</div>
	);
};
