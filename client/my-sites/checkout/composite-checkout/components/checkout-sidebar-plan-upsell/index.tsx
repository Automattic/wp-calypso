import { isPlan } from '@automattic/calypso-products';
import { FormStatus, useFormStatus } from '@automattic/composite-checkout';
import { useShoppingCart } from '@automattic/shopping-cart';
import debugFactory from 'debug';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import PromoCard from 'calypso/components/promo-section/promo-card';
import PromoCardCTA from 'calypso/components/promo-section/promo-card/cta';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { useGetProductVariants } from '../../hooks/product-variants';

import './style.scss';

const debug = debugFactory( 'calypso:checkout-sidebar-plan-upsell' );

export function CheckoutSidebarPlanUpsell() {
	const { formStatus } = useFormStatus();
	const isFormLoading = FormStatus.READY !== formStatus;
	const translate = useTranslate();
	const cartKey = useCartKey();
	const { responseCart, replaceProductInCart } = useShoppingCart( cartKey );
	const siteId = useSelector( getSelectedSiteId );
	const plan = responseCart.products.find( ( product ) => isPlan( product ) );
	const variants = useGetProductVariants( siteId ?? undefined, plan?.product_slug ?? '' );

	if ( ! plan ) {
		debug( 'no plan found in cart' );
		return null;
	}

	const biennialVariant = variants?.find( ( product ) => product.termIntervalInMonths === 24 );
	debug( 'plan in cart:', plan );

	if ( ! biennialVariant ) {
		debug( 'plan in cart has no biennial variant; variants are', variants );
		return null;
	}

	if ( biennialVariant.productId === plan.product_id ) {
		debug( 'plan in cart is already biennial' );
		return null;
	}

	const onUpgradeClick = () => {
		if ( isFormLoading ) {
			return;
		}
		const newPlan = {
			product_slug: biennialVariant.productSlug,
			product_id: biennialVariant.productId,
		};
		debug( 'switching from', plan.product_slug, 'to', newPlan.product_slug );
		replaceProductInCart( plan.uuid, newPlan );
	};

	return (
		<PromoCard
			title={ translate( 'Save 10% by paying for two years' ) }
			className="checkout-sidebar-plan-upsell"
		>
			<div className="checkout-sidebar-plan-upsell__plan-grid">
				<div className="checkout-sidebar-plan-upsell__plan-grid-cell">
					{ translate( 'One year' ) }
				</div>
				<div className="checkout-sidebar-plan-upsell__plan-grid-cell">{ translate( '$60' ) }</div>
				<div className="checkout-sidebar-plan-upsell__plan-grid-cell">
					{ translate( 'Two years' ) }
				</div>
				<div className="checkout-sidebar-plan-upsell__plan-grid-cell">{ translate( '$108' ) }</div>
			</div>
			<PromoCardCTA
				cta={ {
					disabled: isFormLoading,
					busy: isFormLoading,
					text: translate( 'Switch to two year plan' ),
					action: onUpgradeClick,
				} }
			/>
		</PromoCard>
	);
}
