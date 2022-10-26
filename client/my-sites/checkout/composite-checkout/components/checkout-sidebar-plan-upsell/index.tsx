import { isPlan } from '@automattic/calypso-products';
import { FormStatus, useFormStatus } from '@automattic/composite-checkout';
import formatCurrency from '@automattic/format-currency';
import { useShoppingCart } from '@automattic/shopping-cart';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import debugFactory from 'debug';
import { useSelector } from 'react-redux';
import PromoCard from 'calypso/components/promo-section/promo-card';
import PromoCardCTA from 'calypso/components/promo-section/promo-card/cta';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { useGetProductVariants } from '../../hooks/product-variants';
import { getItemVariantDiscountPercentage } from '../item-variation-picker/variant-price';

import './style.scss';

const debug = debugFactory( 'calypso:checkout-sidebar-plan-upsell' );

export function CheckoutSidebarPlanUpsell() {
	const { formStatus } = useFormStatus();
	const isFormLoading = FormStatus.READY !== formStatus;
	const { __ } = useI18n();
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
	const currentVariant = variants?.find( ( product ) => product.productId === plan.product_id );

	if ( ! biennialVariant ) {
		debug( 'plan in cart has no biennial variant; variants are', variants );
		return null;
	}

	if ( ! currentVariant ) {
		debug( 'plan in cart has no current variant; variants are', variants );
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

	const percentSavings = getItemVariantDiscountPercentage( biennialVariant, currentVariant );

	const cardTitle = sprintf(
		// translators: "percentSavings" is the savings percentage for the upgrade as a number, like '20' for '20%'.
		__( 'Save %(percentSavings)d%% by paying for two years' ),
		{ percentSavings }
	);
	return (
		<PromoCard title={ cardTitle } className="checkout-sidebar-plan-upsell">
			<div className="checkout-sidebar-plan-upsell__plan-grid">
				<div className="checkout-sidebar-plan-upsell__plan-grid-cell">
					{ currentVariant.variantLabel }
				</div>
				<div className="checkout-sidebar-plan-upsell__plan-grid-cell">
					{ formatCurrency( currentVariant.price, currentVariant.currency, { stripZeros: true } ) }
				</div>
				<div className="checkout-sidebar-plan-upsell__plan-grid-cell">
					{ biennialVariant.variantLabel }
				</div>
				<div className="checkout-sidebar-plan-upsell__plan-grid-cell">
					{ formatCurrency( biennialVariant.price, biennialVariant.currency, {
						stripZeros: true,
					} ) }
				</div>
			</div>
			<PromoCardCTA
				cta={ {
					disabled: isFormLoading,
					busy: isFormLoading,
					text: __( 'Switch to two year plan' ),
					action: onUpgradeClick,
				} }
			/>
		</PromoCard>
	);
}
