/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import formatCurrency from '@automattic/format-currency';

/**
 * Internal dependencies
 */
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import JetpackProductSlideOutCard from 'calypso/components/jetpack/card/jetpack-product-slide-out-card';
import { planHasFeature } from 'calypso/lib/plans';
import { JETPACK_PRODUCTS_LIST } from 'calypso/lib/products-values/products-list';
import { getPurchaseByProductSlug } from 'calypso/lib/purchases/utils';
import useItemPrice from 'calypso/my-sites/plans-v2/use-item-price';
import { durationToText, productBadgeLabelAlt } from 'calypso/my-sites/plans-v2/utils';
import { getCurrentUserCurrencyCode } from 'calypso/state/current-user/selectors';
import { getSitePurchases } from 'calypso/state/purchases/selectors';
import getSitePlan from 'calypso/state/sites/selectors/get-site-plan';

/**
 * Type dependencies
 */
import type { JetpackProductSlug } from 'calypso/lib/products-values/types';
import type { Duration, PurchaseCallback, SelectorProduct } from 'calypso/my-sites/plans-v2/types';

type Props = {
	product: SelectorProduct;
	productBillingTerm: Duration;
	onProductClick: PurchaseCallback;
};

const FeaturesProductSlideOut: FunctionComponent< Props > = ( {
	product,
	productBillingTerm,
	onProductClick,
} ) => {
	const {
		iconSlug,
		productSlug,
		displayName,
		shortName,
		description,
		displayTerm,
		displayPrice,
		displayCurrency,
		monthlyProductSlug,
	} = product;

	const siteId = useSelector( getSelectedSiteId );
	const currencyCode = useSelector( getCurrentUserCurrencyCode );
	const purchases = useSelector( ( state ) => getSitePurchases( state, siteId ) );
	const sitePlan = useSelector( ( state ) => getSitePlan( state, siteId ) );
	const { originalPrice, discountedPrice } = useItemPrice(
		siteId,
		product,
		monthlyProductSlug || ''
	);
	const isDiscounted = isFinite( discountedPrice as number );
	const price = isDiscounted ? discountedPrice : originalPrice;
	const translate = useTranslate();

	const formattedPrice = formatCurrency(
		( displayPrice || price ) as number,
		( displayCurrency || currencyCode ) as string,
		{
			precision: 0,
		}
	);
	const isItemPurchased = purchases.some(
		( { productSlug: slug } ) =>
			slug === productSlug ||
			JETPACK_PRODUCTS_LIST[ slug as JetpackProductSlug ]?.type === productSlug
	);
	const isItemPlanFeature = !! ( sitePlan && planHasFeature( sitePlan.product_slug, productSlug ) );
	const isOwned = isItemPlanFeature || isItemPurchased;
	const purchase = isItemPlanFeature
		? getPurchaseByProductSlug( purchases, sitePlan?.product_slug || '' )
		: getPurchaseByProductSlug( purchases, productSlug ) ||
		  ( monthlyProductSlug
				? getPurchaseByProductSlug( purchases, monthlyProductSlug )
				: undefined );
	const slideOutButtonLabel = isOwned
		? translate( 'Manage Subscription' )
		: translate( 'Get {{name/}} %(price)s', {
				args: {
					price: formattedPrice,
				},
				components: {
					name: <>{ shortName }</>,
				},
		  } );

	return product ? (
		<JetpackProductSlideOutCard
			iconSlug={ iconSlug }
			productName={ displayName }
			currencyCode={ currencyCode }
			price={ Math.floor( ( displayPrice || price ) as number ) }
			billingTimeFrame={ durationToText( displayTerm || productBillingTerm ) }
			description={ description }
			buttonLabel={ slideOutButtonLabel }
			onButtonClick={ () => onProductClick( product, false, purchase ) }
			buttonPrimary={ ! isOwned }
			isOwned={ isOwned }
			badgeLabel={ productBadgeLabelAlt( product, isItemPurchased, sitePlan ) }
		/>
	) : null;
};

export default FeaturesProductSlideOut;
