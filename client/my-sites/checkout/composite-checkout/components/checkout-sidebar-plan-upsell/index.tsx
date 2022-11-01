import { isPlan } from '@automattic/calypso-products';
import { FormStatus, useFormStatus } from '@automattic/composite-checkout';
import formatCurrency from '@automattic/format-currency';
import { useShoppingCart } from '@automattic/shopping-cart';
import { createElement, createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import debugFactory from 'debug';
import { useSelector, useDispatch } from 'react-redux';
import PromoCard from 'calypso/components/promo-section/promo-card';
import PromoCardCTA from 'calypso/components/promo-section/promo-card/cta';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { useGetProductVariants } from '../../hooks/product-variants';
import {
	getItemVariantCompareToPrice,
	getItemVariantDiscountPercentage,
} from '../item-variation-picker/variant-price';

import './style.scss';

const debug = debugFactory( 'calypso:checkout-sidebar-plan-upsell' );

export function CheckoutSidebarPlanUpsell() {
	const { formStatus } = useFormStatus();
	const reduxDispatch = useDispatch();
	const isFormLoading = FormStatus.READY !== formStatus;
	const { __, hasTranslation } = useI18n();
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
		reduxDispatch(
			recordTracksEvent( 'calypso_checkout_sidebar_upsell_click', {
				upsell_type: 'biennial-plan',
				switching_from: plan.product_slug,
				switching_to: newPlan.product_slug,
			} )
		);
		replaceProductInCart( plan.uuid, newPlan );
	};

	const compareToPriceForVariantTerm = getItemVariantCompareToPrice(
		biennialVariant,
		currentVariant
	);
	const percentSavings = getItemVariantDiscountPercentage( biennialVariant, currentVariant );
	if ( percentSavings === 0 ) {
		debug( 'percent savings is too low', percentSavings );
		return null;
	}

	const cardTitle = createInterpolateElement(
		sprintf(
			// translators: "percentSavings" is the savings percentage for the upgrade as a number, like '20' for '20%'.
			__( '<strong>Save %(percentSavings)d%%</strong> by paying for two years' ),
			{ percentSavings }
		),
		{ strong: createElement( 'strong' ) }
	);

	if ( ! hasTranslation( '<strong>Save %(percentSavings)d%%</strong> by paying for two years' ) ) {
		return null;
	}

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
					{ compareToPriceForVariantTerm && (
						<del className="checkout-sidebar-plan-upsell__do-not-pay">
							{ formatCurrency( compareToPriceForVariantTerm, currentVariant.currency, {
								stripZeros: true,
							} ) }
						</del>
					) }
					{ formatCurrency( biennialVariant.price, biennialVariant.currency, {
						stripZeros: true,
					} ) }
				</div>
			</div>
			<PromoCardCTA
				cta={ {
					disabled: isFormLoading,
					busy: isFormLoading,
					text: __( 'Switch to a two year plan' ),
					action: onUpgradeClick,
				} }
			/>
		</PromoCard>
	);
}
