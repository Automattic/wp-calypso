import { isJetpackPlanSlug, isJetpackSocialSlug } from '@automattic/calypso-products';
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
		getIsIndirectCheckout,
		getIsIncludedInPlan,
		getIsIncludedInPlanOrSuperseded,
		getIsMultisiteCompatible,
		getIsOwned,
		getIsExpired,
		getIsPlanFeature,
		getIsSuperseded,
		getIsUserPurchaseOwner,
		getOnClickPurchase,
		isMultisite,
		getIsProductInCart,
	} = useStoreItemInfoContext();

	const wrapperClassName = classNames( 'jetpack-product-store__all-items', className );

	return (
		<div className={ wrapperClassName }>
			<h2 className="jetpack-product-store__all-items--header">{ heading }</h2>

			<ul className="jetpack-product-store__all-items--grid">
				{ items.map( ( item ) => {
					const isOwned = getIsOwned( item );
					const isExpired = getIsExpired( item );
					const isProductInCart =
						! isJetpackPlanSlug( item.productSlug ) && getIsProductInCart( item );
					const isSuperseded = getIsSuperseded( item );
					const isDeprecated = getIsDeprecated( item );
					const isExternal = getIsExternal( item );
					const isIndirectCheckout = getIsIndirectCheckout( item );
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

					const description = (
						<>
							{ item?.shortDescription || item.description } <br />
							{ ! hideMoreInfoLink && (
								<MoreInfoLink
									onClick={ onClickMoreInfoFactory( item ) }
									item={ item }
									isLinkExternal={ isExternal || isIndirectCheckout }
								/>
							) }
						</>
					);

					const ctaAsPrimary = ! (
						isProductInCart ||
						isOwned ||
						getIsPlanFeature( item ) ||
						isSuperseded
					);

					const isSocialProduct = isJetpackSocialSlug( item.productSlug );

					// Go to the checkout page for all products when they click on the 'GET' CTA,
					// except for Jetpack Social when it isn't owned or included in an active plan,
					// in which case we open a modal.
					let ctaHref = getCheckoutURL( item );
					if ( isSocialProduct && ! isIncludedInPlanOrSuperseded ) {
						ctaHref = `#${ item.productSlug }`;
					}

					const onClickCta = isSocialProduct
						? onClickMoreInfoFactory( item )
						: getOnClickPurchase( item );

					return (
						<li key={ item.productSlug }>
							<SimpleItemCard
								ctaAsPrimary={ ctaAsPrimary }
								ctaHref={ ctaHref }
								ctaLabel={ ctaLabel }
								ctaAriaLabel={ ctaAriaLabel }
								description={ description }
								icon={ <img alt="" src={ getProductIcon( { productSlug: item.productSlug } ) } /> }
								isCtaDisabled={ isCtaDisabled }
								isCtaExternal={ isExternal }
								onClickCta={ onClickCta }
								isProductInCart={ isProductInCart }
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
