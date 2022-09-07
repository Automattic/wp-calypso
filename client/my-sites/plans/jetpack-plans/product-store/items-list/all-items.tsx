import classNames from 'classnames';
import { useStoreItemInfo } from '../hooks/use-store-item-info';
import { ItemPrice } from '../item-price';
import { MoreInfoLink } from '../more-info-link';
import { SimpleItemCard } from '../simple-item-card';
import { AllItemsProps } from '../types';
import getProductIcon from '../utils/get-product-icon';

import './style.scss';

export const AllItems: React.FC< AllItemsProps > = ( {
	className,
	createCheckoutURL,
	duration,
	heading,
	items,
	onClickMoreInfoFactory,
	onClickPurchase,
	siteId,
} ) => {
	const {
		getCheckoutURL,
		getCtaLabel,
		getOnClickPurchase,
		isIncludedInPlan,
		isIncludedInPlanOrSuperseded,
		isMultisiteCompatible,
		isMultisite,
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
					const isItemIncludedInPlan = isIncludedInPlan( item );
					const isMultiSiteIncompatible = isMultisite && ! isMultisiteCompatible( item );

					const isCtaDisabled =
						isMultiSiteIncompatible ||
						( ( isItemOwned || isItemIncludedInPlan ) && ! isUserPurchaseOwner( item ) );

					const ctaLabel = getCtaLabel( item );

					const hideMoreInfoLink =
						isItemDeprecated || isItemOwned || isItemIncludedInPlanOrSuperseded;

					const price = (
						<ItemPrice
							isMultiSiteIncompatible={ isMultiSiteIncompatible }
							isIncludedInPlan={ isItemIncludedInPlan }
							isOwned={ isItemOwned }
							item={ item }
							siteId={ siteId }
						/>
					);

					const description = (
						<>
							{ item?.shortDescription || item.description } <br />
							{ ! hideMoreInfoLink && (
								<MoreInfoLink onClick={ onClickMoreInfoFactory( item ) } item={ item } />
							) }
						</>
					);

					return (
						<SimpleItemCard
							ctaAsPrimary={ ! ( isItemOwned || isPlanFeature( item ) || isItemSuperseded ) }
							ctaHref={ getCheckoutURL( item ) }
							ctaLabel={ ctaLabel }
							description={ description }
							icon={ <img alt="" src={ getProductIcon( { productSlug: item.productSlug } ) } /> }
							isCtaDisabled={ isCtaDisabled }
							key={ item.productSlug }
							onClickCta={ getOnClickPurchase( item ) }
							price={ price }
							title={ item.shortName }
						/>
					);
				} ) }
			</div>
		</div>
	);
};
