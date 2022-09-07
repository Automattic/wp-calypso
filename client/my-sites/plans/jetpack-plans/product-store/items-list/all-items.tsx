import classNames from 'classnames';
import { useStoreItemInfoContext } from '../context/store-item-context';
import { ItemPrice } from '../item-price';
import { MoreInfoLink } from '../more-info-link';
import { SimpleItemCard } from '../simple-item-card';
import { AllItemsProps } from '../types';
import getProductIcon from '../utils/get-product-icon';

import './style.scss';

export const AllItems: React.FC< AllItemsProps > = ( {
	className,
	heading,
	items,
	onClickMoreInfoFactory,
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
	} = useStoreItemInfoContext();

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

					const isCtaDisabled =
						( isItemOwned || isItemIncludedInPlan ) && ! isUserPurchaseOwner( item );

					const ctaLabel = getCtaLabel( item );

					const hideMoreInfoLink =
						isItemDeprecated || isItemOwned || isItemIncludedInPlanOrSuperseded;

					const price = (
						<ItemPrice
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
