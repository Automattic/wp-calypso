import {
	getPlan,
	PLAN_PERSONAL,
	isDomainRegistration,
	isDomainTransfer,
} from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import { StoreProductSlug, useProducts } from '@automattic/data-stores/src/products-list';
import { formatCurrency } from '@automattic/number-formatters';
import {
	type MinimalRequestCartProduct,
	type ResponseCartProduct,
	useShoppingCart,
} from '@automattic/shopping-cart';
import { useTranslate } from 'i18n-calypso';
import { useDispatch } from 'react-redux';
import SectionHeader from 'calypso/components/section-header';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import {
	hasDomainRegistration,
	hasTransferProduct,
	hasPlan,
	planItem,
} from 'calypso/lib/cart-values/cart-items';
import { siteHasPaidPlan } from 'calypso/signup/steps/site-picker/site-picker-submit';
import { useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import useCartKey from '../use-cart-key';

export interface CartFreeUserPlanUpsellProps {
	addItemToCart: ( item: MinimalRequestCartProduct ) => void;
}

const isRegistrationOrTransfer = ( item: ResponseCartProduct ) => {
	return isDomainRegistration( item ) || isDomainTransfer( item );
};

function applyPercentageDiscount( percentageDiscount: number, basePrice: number ): number {
	return basePrice - basePrice * ( percentageDiscount / 100 );
}

function UpgradeText( {
	planPrice,
	planName,
	firstDomain,
}: {
	planPrice: number;
	planName: string;
	firstDomain: ResponseCartProduct;
} ) {
	const translate = useTranslate();
	// Use the subtotal with discounts for the current cart item price if the
	// item's discounts are only for the first year, but use the subtotal
	// without discounts to calculate the price after the upsell because the
	// upsell will remove other first year discounts.
	//
	// For example, if the domain has a sale coupon then it will be removed by
	// the "first year free" bundle discount when a plan is added to the cart
	// because the bundle discount of 100% is higher than the sale coupon
	// discount. Since we are trying to compare the current cart price with the
	// predicted cart price with the plan, we must consider the current cart
	// with the sale and the predicted cart without the sale.
	//
	// This will not be accurate for all types of discounts and predicting what
	// discounts will be applied is difficult, but this makes an attempt based
	// on what discounts are currently applied.
	const isDomainDiscountFromFirstYearOverride = firstDomain.cost_overrides.every(
		( override ) => override.first_unit_only
	);
	// Coupon code discounts will apply before and after the upsell, so we must
	// re-apply them to the price difference also.
	const domainCouponCodeDiscount = firstDomain.cost_overrides.find(
		( override ) => override.override_code === 'coupon-discount'
	);
	const domainCouponPercentageDiscount = domainCouponCodeDiscount?.percentage ?? 0;
	const domainInCartPrice = isDomainDiscountFromFirstYearOverride
		? firstDomain.item_subtotal_integer
		: firstDomain.item_original_subtotal_integer;
	const domainInCartPricePerYear = firstDomain.item_original_subtotal_integer / firstDomain.volume;
	const cartPriceWithDomainAndPlan =
		domainInCartPricePerYear * ( firstDomain.volume - 1 ) + planPrice;

	if ( cartPriceWithDomainAndPlan > domainInCartPrice ) {
		// Re-apply any coupon code discount.
		const extraToPay = applyPercentageDiscount(
			domainCouponPercentageDiscount,
			cartPriceWithDomainAndPlan - domainInCartPrice
		);
		return translate(
			'Pay an {{strong}}extra %(extraToPay)s{{/strong}} for our %(planName)s plan, and get access to all its features, plus the first year of your domain for free.',
			{
				args: {
					extraToPay: formatCurrency( extraToPay, firstDomain.currency, {
						isSmallestUnit: true,
						stripZeros: true,
					} ),
					planName,
				},
				components: {
					strong: <strong />,
				},
			}
		);
	}

	if ( cartPriceWithDomainAndPlan < domainInCartPrice ) {
		// Re-apply any coupon code discount.
		const savings = applyPercentageDiscount(
			domainCouponPercentageDiscount,
			domainInCartPrice - cartPriceWithDomainAndPlan
		);
		return translate(
			'{{strong}}Save %(savings)s{{/strong}} when you purchase a WordPress.com %(planName)s plan instead — your domain comes free for a year.',
			{
				args: {
					planName,
					savings: formatCurrency( savings, firstDomain.currency, {
						isSmallestUnit: true,
						stripZeros: true,
					} ),
				},
				components: {
					strong: <strong />,
				},
			}
		);
	}

	// The plan price and domain price are equal.
	return translate(
		'Purchase our %(planName)s plan at {{strong}}no extra cost{{/strong}}, and get access to all its features, plus the first year of your domain for free.',
		{
			args: { planName },
			components: {
				strong: <strong />,
			},
		}
	);
}

function useGetPriceForProduct( productSlug: string ): number | undefined {
	const { data } = useProducts( [ productSlug as StoreProductSlug ] );
	if ( ! data ) {
		return undefined;
	}
	const productData = data[ productSlug as keyof typeof data ];
	if ( ! productData ) {
		return undefined;
	}
	return productData.costSmallestUnit;
}

export default function CartFreeUserPlanUpsell( { addItemToCart }: CartFreeUserPlanUpsellProps ) {
	const cartKey = useCartKey();
	const {
		responseCart,
		isLoading: isLoadingCart,
		isPendingUpdate: isCartPendingUpdate,
	} = useShoppingCart( cartKey );
	const selectedSite = useSelector( getSelectedSite );
	const isRegisteringOrTransferringDomain =
		hasDomainRegistration( responseCart ) || hasTransferProduct( responseCart );
	const hasPaidPlan = siteHasPaidPlan( selectedSite );
	const hasPlanInCart = hasPlan( responseCart );
	const dispatch = useDispatch();
	const upsellProductSlug = PLAN_PERSONAL;
	const upsellPlan = getPlan( upsellProductSlug );
	const firstDomainInCart = responseCart.products.find( isRegistrationOrTransfer );

	const translate = useTranslate();

	const planPrice = useGetPriceForProduct( upsellProductSlug );
	const planName = upsellPlan?.getTitle();

	if ( ! selectedSite?.ID ) {
		return null;
	}
	if ( isCartPendingUpdate || isLoadingCart ) {
		return null;
	}
	if ( ! planPrice || ! planName ) {
		return null;
	}
	if ( hasPaidPlan || hasPlanInCart ) {
		return null;
	}
	if ( ! isRegisteringOrTransferringDomain || ! firstDomainInCart ) {
		return null;
	}

	const addPlanToCart = () => {
		const planCartItem = planItem( PLAN_PERSONAL );

		if ( planCartItem ) {
			addItemToCart( planCartItem );
			dispatch( recordTracksEvent( 'calypso_non_dwpo_checkout_plan_upsell_add_to_cart', {} ) );
		}
	};

	return (
		<div className="cart__upsell-wrapper">
			<SectionHeader
				className="cart__header cart__upsell-header"
				label={ translate( 'Upgrade and save' ) }
			/>
			<div className="cart__upsell-body">
				<p>
					<UpgradeText
						planPrice={ planPrice }
						planName={ String( planName ) }
						firstDomain={ firstDomainInCart }
					/>
				</p>
				<Button onClick={ addPlanToCart }>{ translate( 'Add to Cart' ) }</Button>
			</div>
			<TrackComponentView eventName="calypso_non_dwpo_checkout_plan_upsell_impression" />
		</div>
	);
}
