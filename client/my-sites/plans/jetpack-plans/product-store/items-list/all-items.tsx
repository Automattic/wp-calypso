import classNames from 'classnames';
import SimpleProductCard from '../simple-product-card';
import { AllItemsProps } from '../types';

import './style.scss';

export const AllItems: React.FC< AllItemsProps > = ( {
	className,
	heading,
	items,
	onClickMoreInfoFactory,
	storeItemInfo,
	siteId,
} ) => {
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

	const wrapperClassName = classNames( 'jetpack-product-store__all-items', className );

	return (
		<div className={ wrapperClassName }>
			<h3 className="jetpack-product-store__all-items--header">{ heading }</h3>

			<div className="jetpack-product-store__all-items--grid">
				{ items.map( ( item ) => {
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
	);
};
