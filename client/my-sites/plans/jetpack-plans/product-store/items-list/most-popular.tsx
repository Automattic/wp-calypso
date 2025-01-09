import { isJetpackPlanSlug } from '@automattic/calypso-products';
import clsx from 'clsx';
import { useStoreItemInfoContext } from '../context/store-item-info-context';
import { FeaturedItemCard } from '../featured-item-card';
import { HeroImage } from '../hero-image';
import { ItemPrice } from '../item-price';
import { MoreInfoLink } from '../more-info-link';
import { MostPopularProps } from '../types';
import { AmountSaved } from './amount-saved';

import './style-most-popular.scss';

export const MostPopular: React.FC< MostPopularProps > = ( {
	className,
	heading,
	items,
	onClickMoreInfoFactory,
	siteId,
} ) => {
	const wrapperClassName = clsx( 'jetpack-product-store__most-popular', className );

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
		getIsProductInCart,
		getIsSuperseded,
		getIsUserPurchaseOwner,
		getOnClickPurchase,
		isMultisite,
		getIsExpired,
	} = useStoreItemInfoContext();

	return (
		<div className={ wrapperClassName }>
			{ heading && <h2 className="jetpack-product-store__most-popular--heading">{ heading }</h2> }
			<ul className="jetpack-product-store__most-popular--items">
				{ items.map( ( item ) => {
					const isOwned = getIsOwned( item );
					const isExpired = getIsExpired( item );
					const isSuperseded = getIsSuperseded( item );
					const isProductInCart =
						! isJetpackPlanSlug( item.productSlug ) && getIsProductInCart( item );
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
							isExpired={ isExpired }
							item={ item }
							siteId={ siteId }
						/>
					);

					const description = <span>{ item.featuredDescription }</span>;
					const moreInfoLink = ! hideMoreInfoLink ? (
						<MoreInfoLink
							item={ item }
							isLinkExternal={ isExternal }
							onClick={ onClickMoreInfoFactory( item ) }
						/>
					) : null;

					const ctaAsPrimary = ! (
						isProductInCart ||
						isOwned ||
						getIsPlanFeature( item ) ||
						isSuperseded
					);

					// TODO remove this isEnglish check once we have translations for the new strings
					const amountSaved = item.productsIncluded?.length ? (
						<AmountSaved
							siteId={ siteId }
							product={ item }
							onClickMoreInfo={ onClickMoreInfoFactory( item ) }
						/>
					) : null;

					return (
						<li key={ item.productSlug } className="jetpack-product-store__most-popular--item">
							<FeaturedItemCard
								amountSaved={ amountSaved }
								ctaAsPrimary={ ctaAsPrimary }
								ctaHref={ getCheckoutURL( item ) }
								ctaLabel={ ctaLabel }
								ctaAriaLabel={ ctaAriaLabel }
								description={ description }
								hero={ <HeroImage item={ item } /> }
								isVertical
								moreInfoLink={ moreInfoLink }
								isCtaDisabled={ isCtaDisabled }
								isCtaExternal={ isExternal }
								isProductInCart={ isProductInCart }
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
