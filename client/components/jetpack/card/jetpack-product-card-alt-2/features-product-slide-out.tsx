/**
 * External dependencies
 */
import React, { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import classNames from 'classnames';
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
import { TERM_ANNUALLY } from 'calypso/lib/plans/constants';

/**
 * Type dependencies
 */
import type { JetpackProductSlug } from 'calypso/lib/products-values/types';
import type { Duration, PurchaseCallback, SelectorProduct } from 'calypso/my-sites/plans-v2/types';

type Props = {
	product: SelectorProduct;
	productBillingTerm: Duration;
	isOpen: boolean;
	onProductClick: PurchaseCallback;
};

const FeaturesProductSlideOut: FunctionComponent< Props > = ( {
	product,
	productBillingTerm,
	isOpen,
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
	const isUpgradeableToYearly =
		( isOwned &&
			productBillingTerm === TERM_ANNUALLY &&
			monthlyProductSlug &&
			purchases.some( ( { productSlug } ) => productSlug === monthlyProductSlug ) ) ||
		false;
	const purchase = isItemPlanFeature
		? getPurchaseByProductSlug( purchases, sitePlan?.product_slug || '' )
		: getPurchaseByProductSlug( purchases, productSlug ) ||
		  ( monthlyProductSlug
				? getPurchaseByProductSlug( purchases, monthlyProductSlug )
				: undefined );

	const slideOutButtonLabel = useMemo( () => {
		if ( isOwned ) {
			if ( isUpgradeableToYearly ) {
				return translate( 'Upgrade to Yearly' );
			}
			return translate( 'Manage Subscription' );
		}
		return translate( 'Get {{name/}} %(price)s', {
			args: {
				price: formattedPrice,
			},
			components: {
				name: <>{ shortName }</>,
			},
			comment:
				'{name}: is the jetpack product name, ie- Backup Daily, Backup Real-time, Scan, Anti-spam, Search, Jetpack CRM',
		} );
	}, [ isOwned, isUpgradeableToYearly, formattedPrice, shortName ] );

	return (
		<div
			className={ classNames( 'jetpack-product-card-alt-2__slide-out-product', {
				expanded: isOpen,
			} ) }
		>
			{ isOpen && (
				<JetpackProductSlideOutCard
					iconSlug={ iconSlug }
					productName={ displayName }
					currencyCode={ currencyCode }
					price={ Math.floor( ( displayPrice || price ) as number ) }
					billingTimeFrame={ durationToText( displayTerm || productBillingTerm ) }
					description={ description }
					buttonLabel={ slideOutButtonLabel }
					onButtonClick={ () => onProductClick( product, isUpgradeableToYearly, purchase ) }
					buttonPrimary={ ! isOwned }
					isOwned={ isOwned }
					badgeLabel={ productBadgeLabelAlt( product, isItemPurchased, sitePlan ) }
				/>
			) }
		</div>
	);
};

export default FeaturesProductSlideOut;
