import {
	getPlan,
	PLAN_PERSONAL,
	isDomainRegistration,
	isDomainTransfer,
} from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import formatCurrency from '@automattic/format-currency';
import {
	type ResponseCart,
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

function UpgradeText( {
	cart,
	planPrice,
	upsellPlan,
}: {
	cart: ResponseCart;
	planPrice: number;
	upsellPlan: ReturnType< typeof getPlan >;
} ) {
	const translate = useTranslate();
	const firstDomain = cart.products.find( isRegistrationOrTransfer );
	const planName = upsellPlan?.getTitle() ?? '';

	if ( planPrice && firstDomain && planPrice > firstDomain.cost ) {
		const extraToPay = planPrice - firstDomain.cost;
		return translate(
			'Pay an {{strong}}extra %(extraToPay)s{{/strong}} for our %(planName)s plan, and get access to all its ' +
				'features, plus the first year of your domain for free.',
			{
				args: {
					extraToPay: formatCurrency( extraToPay, firstDomain.currency ),
					planName,
				},
				components: {
					strong: <strong />,
				},
			}
		);
	} else if ( planPrice && firstDomain && planPrice < firstDomain.cost ) {
		const savings = firstDomain.cost - planPrice;
		return translate(
			'{{strong}}Save %(savings)s{{/strong}} when you purchase a WordPress.com %(planName)s plan ' +
				'instead — your domain comes free for a year.',
			{
				args: {
					planName,
					savings: formatCurrency( savings, firstDomain.currency ),
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
	const showPlanUpsell = !! selectedSite?.ID;
	const hasPaidPlan = siteHasPaidPlan( selectedSite );
	const hasPlanInCart = hasPlan( responseCart );
	const dispatch = useDispatch();
	const upsellPlan = getPlan( PLAN_PERSONAL );

	const translate = useTranslate();

	// FIXME
	const planPrice = 0;

	const shouldRender = ( () => {
		if ( isCartPendingUpdate || isLoadingCart ) {
			return false;
		}

		return (
			isRegisteringOrTransferringDomain &&
			showPlanUpsell &&
			selectedSite &&
			! hasPaidPlan &&
			! hasPlanInCart
		);
	} )();

	const addPlanToCart = () => {
		const planCartItem = planItem( PLAN_PERSONAL );

		if ( planCartItem ) {
			addItemToCart( planCartItem );
			dispatch( recordTracksEvent( 'calypso_non_dwpo_checkout_plan_upsell_add_to_cart', {} ) );
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
					<UpgradeText cart={ responseCart } planPrice={ planPrice } upsellPlan={ upsellPlan } />
				</p>
				<Button onClick={ addPlanToCart }>{ translate( 'Add to Cart' ) }</Button>
			</div>
			<TrackComponentView eventName="calypso_non_dwpo_checkout_plan_upsell_impression" />
		</div>
	);
}
