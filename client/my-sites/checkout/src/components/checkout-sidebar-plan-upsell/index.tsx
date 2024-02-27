import { isPlan, isJetpackPlan } from '@automattic/calypso-products';
import { FormStatus, useFormStatus } from '@automattic/composite-checkout';
import formatCurrency from '@automattic/format-currency';
import { ResponseCart, useShoppingCart } from '@automattic/shopping-cart';
import styled from '@emotion/styled';
import { createElement, createInterpolateElement, useState } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import debugFactory from 'debug';
import { useTranslate } from 'i18n-calypso';
import PromoCard from 'calypso/components/promo-section/promo-card';
import PromoCardCTA from 'calypso/components/promo-section/promo-card/cta';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { useGetProductVariants } from '../../hooks/product-variants';
import { useCheckoutV2 } from '../../hooks/use-checkout-v2';
import { WPCOMProductVariant } from '../item-variation-picker/types';
import {
	getItemVariantCompareToPrice,
	getItemVariantDiscountPercentage,
} from '../item-variation-picker/util';
import './style.scss';

const debug = debugFactory( 'calypso:checkout-sidebar-plan-upsell' );

const CheckoutPromoCard: React.FC< {
	responseCart: ResponseCart;
	variants: WPCOMProductVariant[];
} > = ( { responseCart, variants } ) => {
	const translate = useTranslate();
	const plan = responseCart.products.find(
		( product ) => isPlan( product ) && ! isJetpackPlan( product )
	);
	const hasDomainRegistration = responseCart.products.find(
		( product ) => product.is_domain_registration
	)?.is_domain_registration;

	const PromoCardV2 = styled.div`
		position: relative;
		background-color: #bbe0fa;
		border-radius: 4px;
		font-size: 12px;
		font-weight: 500;
		align-self: flex-end;

		p {
			margin: 0;
			padding: 8px 16px;
		}

		&:before {
			background-color: #bbe0fa;
			display: block;
			top: -5px;
			content: '';
			height: 8px;
			right: 8%;
			margin-left: -4px;
			position: absolute;
			transform: rotate( 225deg );
			width: 8px;
		}
	`;

	const currentVariant = variants?.find( ( product ) => product.productId === plan?.product_id );

	const isMonthly = currentVariant?.termIntervalInMonths === 1;
	const isYearly = currentVariant?.termIntervalInMonths === 12;
	const isBiennially = currentVariant?.termIntervalInMonths === 24;
	const isTriennially = currentVariant?.termIntervalInMonths === 36;

	let labelText = '';

	if ( isMonthly ) {
		if ( hasDomainRegistration ) {
			labelText = translate(
				'Save money with longer billing cycles and get [domain name] free for the first year with annual plans'
			);
		}

		labelText = translate(
			'Longer plan billing cycles save you money and include a custom domain for free for the first year.'
		);
	}

	if ( isYearly ) {
		labelText = translate(
			'Longer plan billing cycles save you money and include a custom domain for free for the first year.'
		);
	}

	if ( isBiennially ) {
		labelText = translate(
			'Longer plan billing cycles save you money and include a custom domain for free for the first year.'
		);
	}

	if ( isTriennially ) {
		labelText = translate(
			'Longer plan billing cycles save you money and include a custom domain for free for the first year.'
		);
	}

	return (
		<PromoCardV2>
			<div className="checkout-sidebar-plan-upsell__v2-wrapper">
				<p>{ labelText }</p>
			</div>
		</PromoCardV2>
	);
};

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
	const shouldUseCheckoutV2 = useCheckoutV2() === 'treatment';

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

	const biennialVariant = variants?.find( ( product ) => product.termIntervalInMonths === 24 );
	const triennialVariant = variants?.find( ( product ) => product.termIntervalInMonths === 36 );
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
			{ plan && shouldUseCheckoutV2 ? (
				<CheckoutPromoCard responseCart={ responseCart } variants={ variants } />
			) : (
				<PromoCard title={ cardTitle } className="checkout-sidebar-plan-upsell">
					<div className="checkout-sidebar-plan-upsell__plan-grid">
						{ isComparisonWithIntroOffer && (
							<>
								<div className="checkout-sidebar-plan-upsell__plan-grid-cell"></div>
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
			) }
		</>
	);
}
