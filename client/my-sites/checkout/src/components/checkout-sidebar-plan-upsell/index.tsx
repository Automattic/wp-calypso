import { isPlan, isJetpackPlan } from '@automattic/calypso-products';
import { FormStatus, useFormStatus } from '@automattic/composite-checkout';
import formatCurrency from '@automattic/format-currency';
import { useShoppingCart } from '@automattic/shopping-cart';
import { createElement, createInterpolateElement, useState } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import debugFactory from 'debug';
import PromoCard from 'calypso/components/promo-section/promo-card';
import PromoCardCTA from 'calypso/components/promo-section/promo-card/cta';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { useGetProductVariants } from '../../hooks/product-variants';
import {
	getItemVariantCompareToPrice,
	getItemVariantDiscountPercentage,
} from '../item-variation-picker/util';
import './style.scss';

const debug = debugFactory( 'calypso:checkout-sidebar-plan-upsell' );

export function CheckoutSidebarPlanUpsell() {
	const { formStatus } = useFormStatus();
	const reduxDispatch = useDispatch();
	const isFormLoading = FormStatus.READY !== formStatus;
	const [ isClicked, setIsClicked ] = useState( false );
	const { __ } = useI18n();
	const cartKey = useCartKey();
	const { responseCart, replaceProductInCart } = useShoppingCart( cartKey );
	const plan = responseCart.products.find(
		( product ) => isPlan( product ) && ! isJetpackPlan( product )
	);

	const variants = useGetProductVariants( plan );

	function isBusy() {
		// If the FormStatus is SUBMITTING and the user has not clicked this button, we want to return false for isBusy
		if ( ! isClicked ) {
			return false;
		}

		// If the FormStatus is LOADING, VALIDATING, or SUBMITTING, we want to return true for isBusy
		if ( isFormLoading ) {
			return true;
		}
		// If FormStatus is READY or COMPLETE, we want to return false for isBusy
		return false;
	}

	if ( ! plan ) {
		debug( 'no plan found in cart' );
		return null;
	}
	const annualVariant = variants?.find( ( product ) => product.termIntervalInMonths === 12 );
	const biennialVariant = variants?.find( ( product ) => product.termIntervalInMonths === 24 );
	const triennialVariant = variants?.find( ( product ) => product.termIntervalInMonths === 36 );
	const currentVariant = variants?.find( ( product ) => product.productId === plan.product_id );

	if ( ! annualVariant ) {
		debug( 'plan in cart has no annual variant; variants are', variants );
		return null;
	}

	if ( ! biennialVariant ) {
		debug( 'plan in cart has no biennial variant; variants are', variants );
		return null;
	}

	if ( ! currentVariant ) {
		debug( 'plan in cart has no current variant; variants are', variants );
		return null;
	}

	if ( biennialVariant.productId === plan?.product_id ) {
		debug( 'plan in cart is already biennial' );
		return null;
	}

	// If the current plan is a triennial plan, we don't want to show an upsell.
	if ( triennialVariant?.productId === plan.product_id ) {
		debug( 'plan is triennial. hide upsell.' );
		return null;
	}

	const onUpgradeClick = async () => {
		setIsClicked( true );
		if ( isFormLoading ) {
			return;
		}

		let newPlan;

		if ( currentVariant.termIntervalInMonths === 1 ) {
			newPlan = {
				product_slug: annualVariant.productSlug,
				product_id: annualVariant.productId,
			};
		}

		if ( currentVariant.termIntervalInMonths === 12 ) {
			newPlan = {
				product_slug: biennialVariant.productSlug,
				product_id: biennialVariant.productId,
			};
		}

		if ( ! newPlan ) {
			return;
		}

		debug( 'switching from', plan.product_slug, 'to', newPlan.product_slug );
		reduxDispatch(
			recordTracksEvent( 'calypso_checkout_sidebar_upsell_click', {
				upsell_type: 'biennial-plan',
				switching_from: plan.product_slug,
				switching_to: newPlan.product_slug,
			} )
		);
		try {
			await replaceProductInCart( plan.uuid, newPlan );
			setIsClicked( false );
		} catch ( error ) {
			// This will already be displayed to the user
			// eslint-disable-next-line no-console
			console.error( error );
			setIsClicked( false );
		}
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

	const isComparisonWithIntroOffer =
		biennialVariant.introductoryInterval === 2 &&
		biennialVariant.introductoryTerm === 'year' &&
		currentVariant.introductoryInterval === 1 &&
		currentVariant.introductoryTerm === 'year';

	const cardTitle = createInterpolateElement(
		sprintf(
			// translators: "percentSavings" is the savings percentage for the upgrade as a number, like '20' for '20%'.
			__( '<strong>Save %(percentSavings)d%%</strong> by paying for two years' ),
			{ percentSavings }
		),
		{ strong: createElement( 'strong' ) }
	);
	return (
		<>
			<PromoCard title={ cardTitle } className="checkout-sidebar-plan-upsell">
				<div className="checkout-sidebar-plan-upsell__plan-grid">
					{ isComparisonWithIntroOffer && (
						<>
							<div className="checkout-sidebar-plan-upsell__plan-grid-cell">
								<strong>{ __( 'Plan' ) }</strong>
							</div>
							<div className="checkout-sidebar-plan-upsell__plan-grid-cell">
								<strong>{ __( 'Two-year cost' ) }</strong>
							</div>
						</>
					) }
					<div className="checkout-sidebar-plan-upsell__plan-grid-cell">
						{ currentVariant.variantLabel }
					</div>
					<div className="checkout-sidebar-plan-upsell__plan-grid-cell">
						{ formatCurrency(
							currentVariant.priceInteger +
								( isComparisonWithIntroOffer ? currentVariant.priceBeforeDiscounts : 0 ),
							currentVariant.currency,
							{
								stripZeros: true,
								isSmallestUnit: true,
							}
						) }
					</div>
					<div className="checkout-sidebar-plan-upsell__plan-grid-cell">
						{ biennialVariant.variantLabel }
					</div>
					<div className="checkout-sidebar-plan-upsell__plan-grid-cell">
						{ compareToPriceForVariantTerm && (
							<del className="checkout-sidebar-plan-upsell__do-not-pay">
								{ formatCurrency( compareToPriceForVariantTerm, currentVariant.currency, {
									stripZeros: true,
									isSmallestUnit: true,
								} ) }
							</del>
						) }
						{ formatCurrency( biennialVariant.priceInteger, biennialVariant.currency, {
							stripZeros: true,
							isSmallestUnit: true,
						} ) }
					</div>
				</div>
				<PromoCardCTA
					cta={ {
						disabled: isFormLoading,
						busy: isBusy(),
						text: __( 'Switch to a two-year plan' ),
						action: onUpgradeClick,
					} }
				/>
			</PromoCard>
		</>
	);
}
