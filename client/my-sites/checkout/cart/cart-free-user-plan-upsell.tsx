import {
	getPlan,
	PLAN_PERSONAL,
	isDomainRegistration,
	isDomainTransfer,
} from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import { StoreProductSlug, useProducts } from '@automattic/data-stores/src/products-list';
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

	if ( firstDomain && planPrice > firstDomain.item_subtotal_integer ) {
		const extraToPay = planPrice - firstDomain.item_subtotal_integer;
		return translate(
			'Pay an {{strong}}extra %(extraToPay)s{{/strong}} for our %(planName)s plan, and get access to all its features, plus the first year of your domain for free.',
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
	}

	if ( firstDomain && planPrice < firstDomain.item_subtotal_integer ) {
		const savings = firstDomain.item_subtotal_integer - planPrice;
		return translate(
			'{{strong}}Save %(savings)s{{/strong}} when you purchase a WordPress.com %(planName)s plan instead — your domain comes free for a year.',
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

	const translate = useTranslate();

	const planPrice = useGetPriceForProduct( upsellProductSlug );

	if ( ! selectedSite?.ID ) {
		return null;
	}
	if ( isCartPendingUpdate || isLoadingCart ) {
		return null;
	}
	if ( ! planPrice ) {
		return null;
	}
	if ( hasPaidPlan || hasPlanInCart ) {
		return null;
	}
	if ( ! isRegisteringOrTransferringDomain ) {
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
					<UpgradeText cart={ responseCart } planPrice={ planPrice } upsellPlan={ upsellPlan } />
				</p>
				<Button onClick={ addPlanToCart }>{ translate( 'Add to Cart' ) }</Button>
			</div>
			<TrackComponentView eventName="calypso_non_dwpo_checkout_plan_upsell_impression" />
		</div>
	);
}
