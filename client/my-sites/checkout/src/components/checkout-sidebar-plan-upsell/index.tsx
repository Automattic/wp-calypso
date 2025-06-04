import { isPlan, isJetpackPlan } from '@automattic/calypso-products';
import { FormStatus, useFormStatus } from '@automattic/composite-checkout';
import { formatCurrency } from '@automattic/number-formatters';
import { useShoppingCart } from '@automattic/shopping-cart';
import { createElement, createInterpolateElement, useState } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import debugFactory from 'debug';
import PromoCard from 'calypso/components/promo-section/promo-card';
import PromoCardCTA from 'calypso/components/promo-section/promo-card/cta';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import {
	useStreamlinedPriceExperiment,
	isStreamlinedPriceCheckoutTreatment,
} from 'calypso/my-sites/plans-features-main/hooks/use-streamlined-price-experiment';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { useGetProductVariants } from '../../hooks/product-variants';
import {
	getItemVariantCompareToPrice,
	getItemVariantDiscount,
} from '../item-variation-picker/util';
import type { WPCOMProductVariant } from '../item-variation-picker';
import './style.scss';

const debug = debugFactory( 'calypso:checkout-sidebar-plan-upsell' );

/**
 *  Finds the next higher billing term variant from a list of product variants.
 */
function getUpsellVariant( currentVariant: WPCOMProductVariant, variants: WPCOMProductVariant[] ) {
	const nextHigherBillingTermInMonths =
		Math.ceil( ( currentVariant.productBillingTermInMonths + 1 ) / 12 ) * 12;

	return variants?.find(
		( product ) => product.termIntervalInMonths === nextHigherBillingTermInMonths
	);
}

function getUpsellTextForVariant(
	upsellVariant: WPCOMProductVariant,
	percentSavings: number,
	__: any,
	isStreamlinedPrice: boolean
) {
	if ( upsellVariant.productBillingTermInMonths === 12 ) {
		// translators: "percentSavings" is the savings percentage for the upgrade as a number, like '20' for '20%'.
		const cardTitle = __( '<strong>Save %(percentSavings)d%%</strong> by paying annually' );
		return {
			cardTitle: createInterpolateElement( sprintf( cardTitle, { percentSavings } ), {
				strong: createElement( 'strong' ),
			} ),
			cellLabel: __( 'One-year cost' ),
			ctaText: __( 'Switch to an annual plan' ),
		};
	}

	if ( upsellVariant.productBillingTermInMonths === 24 ) {
		const cardTitle = isStreamlinedPrice
			? // translators: "percentSavings" is the savings percentage for the upgrade as a number, like '20' for '20%'.
			  __( '<strong>Save %(percentSavings)d%% extra</strong> by paying for two years' )
			: // translators: "percentSavings" is the savings percentage for the upgrade as a number, like '20' for '20%'.
			  __( '<strong>Save %(percentSavings)d%%</strong> by paying for two years' );
		return {
			cardTitle: createInterpolateElement( sprintf( cardTitle, { percentSavings } ), {
				strong: createElement( 'strong' ),
			} ),
			cellLabel: __( 'Two-year cost' ),
			ctaText: __( 'Switch to a two-year plan' ),
		};
	}

	if ( upsellVariant.productBillingTermInMonths === 36 ) {
		const cardTitle = isStreamlinedPrice
			? // translators: "percentSavings" is the savings percentage for the upgrade as a number, like '20' for '20%'.
			  __( '<strong>Save %(percentSavings)d%% extra</strong> by paying for three years' )
			: // translators: "percentSavings" is the savings percentage for the upgrade as a number, like '20' for '20%'.
			  __( '<strong>Save %(percentSavings)d%%</strong> by paying for three years' );
		return {
			cardTitle: createInterpolateElement( sprintf( cardTitle, { percentSavings } ), {
				strong: createElement( 'strong' ),
			} ),
			cellLabel: __( 'Three-year cost' ),
			ctaText: __( 'Switch to a three-year plan' ),
		};
	}
}

function getTracksEventUpsellType( upsellVariant: WPCOMProductVariant ) {
	switch ( upsellVariant.productBillingTermInMonths ) {
		case 12:
			return 'annual-plan';
		case 24:
			return 'biennial-plan';
		case 36:
			return 'triennial-plan';
		default:
			return '';
	}
}

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
	const [ , streamlinedPriceExperimentAssignment ] = useStreamlinedPriceExperiment();

	const variants = useGetProductVariants( plan );

	if ( ! plan ) {
		debug( 'no plan found in cart' );
		return null;
	}

	if ( plan.extra?.hideProductVariants ) {
		return null;
	}

	const currentVariant = variants?.find( ( product ) => product.productId === plan.product_id );

	if ( ! currentVariant ) {
		debug( 'plan in cart has no current variant; variants are', variants );
		return null;
	}

	const upsellVariant = getUpsellVariant( currentVariant, variants );

	if ( ! upsellVariant ) {
		debug( 'plan in cart has no upsell variant; variants are', variants );
		return null;
	}

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

	const onUpgradeClick = async () => {
		setIsClicked( true );
		if ( isFormLoading ) {
			return;
		}

		const newPlan = {
			product_slug: upsellVariant.productSlug,
			product_id: upsellVariant.productId,
		};

		debug( 'switching from', plan.product_slug, 'to', newPlan.product_slug );
		reduxDispatch(
			recordTracksEvent( 'calypso_checkout_sidebar_upsell_click', {
				upsell_type: getTracksEventUpsellType( upsellVariant ),
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
		upsellVariant,
		currentVariant
	);
	const percentSavings = getItemVariantDiscount( upsellVariant, currentVariant );
	if ( percentSavings === 0 ) {
		debug( 'percent savings is too low', percentSavings );
		return null;
	}

	const isComparisonWithIntroOffer =
		upsellVariant.introductoryInterval === 2 &&
		upsellVariant.introductoryTerm === 'year' &&
		currentVariant.introductoryInterval === 1 &&
		currentVariant.introductoryTerm === 'year';

	const upsellText = getUpsellTextForVariant(
		upsellVariant,
		percentSavings,
		__,
		isStreamlinedPriceCheckoutTreatment( streamlinedPriceExperimentAssignment )
	);

	if ( ! upsellText ) {
		return;
	}

	const { cardTitle, cellLabel, ctaText } = upsellText;

	const checkoutSidebarPlanUpsellClassName =
		'checkout-sidebar-plan-upsell' +
		( isStreamlinedPriceCheckoutTreatment( streamlinedPriceExperimentAssignment )
			? ' checkout-sidebar-plan-upsell-streamlined'
			: '' );

	return (
		<>
			<PromoCard title={ cardTitle } className={ checkoutSidebarPlanUpsellClassName }>
				<div className="checkout-sidebar-plan-upsell__plan-grid">
					{ ! isStreamlinedPriceCheckoutTreatment( streamlinedPriceExperimentAssignment ) && (
						<>
							<div className="checkout-sidebar-plan-upsell__plan-grid-cell">
								<strong>{ __( 'Plan' ) }</strong>
							</div>
							<div className="checkout-sidebar-plan-upsell__plan-grid-cell">
								<strong>{ isComparisonWithIntroOffer ? cellLabel : __( 'Cost' ) }</strong>
							</div>
						</>
					) }
					<div className="checkout-sidebar-plan-upsell__plan-grid-cell">
						{ currentVariant.variantLabel.adjective }
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
						{ upsellVariant.variantLabel.adjective }
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
						{ formatCurrency( upsellVariant.priceInteger, upsellVariant.currency, {
							stripZeros: true,
							isSmallestUnit: true,
						} ) }
					</div>
				</div>
				<PromoCardCTA
					cta={ {
						disabled: isFormLoading,
						busy: isBusy(),
						text: ctaText,
						action: onUpgradeClick,
					} }
				/>
			</PromoCard>
		</>
	);
}
