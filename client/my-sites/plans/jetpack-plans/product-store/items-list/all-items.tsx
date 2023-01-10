import classNames from 'classnames';
import { useStoreItemInfoContext } from '../context/store-item-info-context';
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
		getCtaAriaLabel,
		getIsDeprecated,
		getIsExternal,
		getIsIncludedInPlan,
		getIsIncludedInPlanOrSuperseded,
		getIsMultisiteCompatible,
		getIsOwned,
		getIsPlanFeature,
		getIsSuperseded,
		getIsUserPurchaseOwner,
		getOnClickPurchase,
		isMultisite,
	} = useStoreItemInfoContext();

	const wrapperClassName = classNames( 'jetpack-product-store__all-items', className );

	return (
		<div className={ wrapperClassName }>
			<h2 className="jetpack-product-store__all-items--header">{ heading }</h2>

			<ul className="jetpack-product-store__all-items--grid">
				{ items.map( ( item ) => {
					const isOwned = getIsOwned( item );
					const isSuperseded = getIsSuperseded( item );
					const isDeprecated = getIsDeprecated( item );
					const isExternal = getIsExternal( item );
					const isIncludedInPlanOrSuperseded = getIsIncludedInPlanOrSuperseded( item );
					const isIncludedInPlan = getIsIncludedInPlan( item );
					const isMultiSiteIncompatible = isMultisite && ! getIsMultisiteCompatible( item );

					const isCtaDisabled =
						isMultiSiteIncompatible ||
						( ( isOwned || isIncludedInPlan ) && ! getIsUserPurchaseOwner( item ) );

					const ctaLabel = getCtaLabel( item );
					const ctaAriaLabel = getCtaAriaLabel( item );

					const hideMoreInfoLink = isDeprecated || isOwned || isIncludedInPlanOrSuperseded;

					const price = (
						<ItemPrice
							isMultiSiteIncompatible={ isMultiSiteIncompatible }
							isIncludedInPlan={ isIncludedInPlan }
							isOwned={ isOwned }
							item={ item }
							siteId={ siteId }
						/>
					);

					const description = (
						<>
							{ item?.shortDescription || item.description } <br />
							{ ! hideMoreInfoLink && (
								<MoreInfoLink
									onClick={ onClickMoreInfoFactory( item ) }
									item={ item }
									isExternal={ isExternal }
								/>
							) }
						</>
					);

					const ctaAsPrimary = ! ( isOwned || getIsPlanFeature( item ) || isSuperseded );

					return (
						<li key={ item.productSlug }>
							<SimpleItemCard
								ctaAsPrimary={ ctaAsPrimary }
								ctaHref={ getCheckoutURL( item ) }
								ctaLabel={ ctaLabel }
								ctaAriaLabel={ ctaAriaLabel }
								description={ description }
								icon={ <img alt="" src={ getProductIcon( { productSlug: item.productSlug } ) } /> }
								isCtaDisabled={ isCtaDisabled }
								isCtaExternal={ isExternal }
								onClickCta={ getOnClickPurchase( item ) }
								price={ price }
								title={ item.displayName }
							/>
						</li>
					);
				} ) }
			</ul>
		</div>
	);
};
