import { recordTracksEvent } from '@automattic/calypso-analytics';
import {
	getPlan,
	PLAN_PERSONAL,
	isDomainRegistration,
	isDomainTransfer,
} from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import { Plans } from '@automattic/data-stores';
import formatCurrency from '@automattic/format-currency';
import { useTranslate } from 'i18n-calypso';
import SectionHeader from 'calypso/components/section-header';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import {
	hasDomainRegistration,
	hasTransferProduct,
	hasPlan,
	planItem,
} from 'calypso/lib/cart-values/cart-items';
import useCheckPlanAvailabilityForPurchase from 'calypso/my-sites/plans-features-main/hooks/use-check-plan-availability-for-purchase';
import { siteHasPaidPlan } from 'calypso/signup/steps/site-picker/site-picker-submit';
import { useSelector } from 'calypso/state';
import { isRequestingPlans } from 'calypso/state/plans/selectors';
import { isRequestingSitePlans } from 'calypso/state/sites/plans/selectors';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
import type {
	ResponseCart,
	MinimalRequestCartProduct,
	ResponseCartProduct,
} from '@automattic/shopping-cart';

export interface CartFreeUserPlanUpsellProps {
	cart: Pick< ResponseCart, 'products' >;
	isCartPendingUpdate?: boolean;
	addItemToCart: ( item: MinimalRequestCartProduct ) => void;
}

const isRegistrationOrTransfer = ( item: ResponseCartProduct ) => {
	return isDomainRegistration( item ) || isDomainTransfer( item );
};

const UpgradeText = ( { cart }: { cart: Pick< ResponseCart, 'products' > } ) => {
	const upsellPlan = getPlan( PLAN_PERSONAL );
	const translate = useTranslate();
	const firstDomain = cart.products.find( isRegistrationOrTransfer );
	const planName = upsellPlan?.getTitle() ?? '';
	const selectedSiteId = useSelector( getSelectedSiteId );
	const pricingMeta = Plans.usePricingMetaForGridPlans( {
		planSlugs: [ PLAN_PERSONAL ],
		selectedSiteId,
		coupon: undefined,
		useCheckPlanAvailabilityForPurchase,
		storageAddOns: null,
	} );
	const planPrice =
		pricingMeta?.[ PLAN_PERSONAL ]?.discountedPrice.full ||
		pricingMeta?.[ PLAN_PERSONAL ]?.originalPrice.full;

	if ( planPrice && firstDomain && planPrice > firstDomain.item_subtotal_integer ) {
		const extraToPay = planPrice - firstDomain.item_subtotal_integer;
		return translate(
			'Pay an {{strong}}extra %(extraToPay)s{{/strong}} for our %(planName)s plan, and get access to all its ' +
				'features, plus the first year of your domain for free.',
			{
				args: {
					extraToPay: formatCurrency( extraToPay, firstDomain.currency, { isSmallestUnit: true } ),
					planName,
				},
				components: {
					strong: <strong />,
				},
			}
		);
	} else if ( planPrice && firstDomain && planPrice < firstDomain.item_subtotal_integer ) {
		const savings = firstDomain.item_subtotal_integer - planPrice;
		return translate(
			'{{strong}}Save %(savings)s{{/strong}} when you purchase a WordPress.com %(planName)s plan ' +
				'instead — your domain comes free for a year.',
			{
				args: {
					planName,
					savings: formatCurrency( savings, firstDomain.currency, { isSmallestUnit: true } ),
				},
				components: {
					strong: <strong />,
				},
			}
		);
	}

	return translate(
		'Purchase our %(planName)s plan at {{strong}}no extra cost{{/strong}}, and get access to all its ' +
			'features, plus the first year of your domain for free.',
		{
			args: { planName },
			components: {
				strong: <strong />,
			},
		}
	);
};

const useShouldRender = ( {
	cart,
	isCartPendingUpdate,
}: Omit< CartFreeUserPlanUpsellProps, 'addItemToCart' > ) => {
	const selectedSite = useSelector( getSelectedSite );
	const selectedSiteId = selectedSite ? selectedSite.ID : null;
	const isRequestingPlansInState = useSelector( ( state ) => {
		return isRequestingPlans( state ) || isRequestingSitePlans( state );
	} );
	const { isLoading: isRequestingPlansInStore } = Plans.usePlans( { coupon: undefined } );
	const isRegisteringOrTransferringDomain =
		hasDomainRegistration( cart ) || hasTransferProduct( cart );

	if ( isCartPendingUpdate || isRequestingPlansInState || isRequestingPlansInStore ) {
		return false;
	}

	return (
		isRegisteringOrTransferringDomain &&
		!! selectedSiteId &&
		selectedSite &&
		! siteHasPaidPlan( selectedSite ) &&
		! hasPlan( cart )
	);
};

const CartFreeUserPlanUpsell = ( {
	cart,
	isCartPendingUpdate,
	addItemToCart,
}: CartFreeUserPlanUpsellProps ) => {
	const translate = useTranslate();
	const shouldRender = useShouldRender( { cart, isCartPendingUpdate } );

	const handleAddPlanToCart = () => {
		const planCartItem = planItem( PLAN_PERSONAL );

		if ( planCartItem ) {
			addItemToCart( planCartItem );
			recordTracksEvent( 'calypso_non_dwpo_checkout_plan_upsell_add_to_cart', {} );
		}
	};

	if ( ! shouldRender ) {
		return null;
	}

	return (
		<div className="cart__upsell-wrapper">
			<SectionHeader
				className="cart__header cart__upsell-header"
				label={ translate( 'Upgrade and save' ) }
			/>
			<div className="cart__upsell-body">
				<p>
					<UpgradeText cart={ cart } />
				</p>
				<Button onClick={ handleAddPlanToCart }>{ translate( 'Add to Cart' ) }</Button>
			</div>
			<TrackComponentView eventName="calypso_non_dwpo_checkout_plan_upsell_impression" />
		</div>
	);
};

export default CartFreeUserPlanUpsell;
