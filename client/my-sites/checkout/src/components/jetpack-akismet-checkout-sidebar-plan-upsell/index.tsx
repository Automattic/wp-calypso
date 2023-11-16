import { isJetpackProduct, isJetpackPlan, isAkismetProduct } from '@automattic/calypso-products';
import { FormStatus, useFormStatus } from '@automattic/composite-checkout';
import formatCurrency from '@automattic/format-currency';
import { useShoppingCart } from '@automattic/shopping-cart';
import { createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import classNames from 'classnames';
import debugFactory from 'debug';
import PromoCard from 'calypso/components/promo-section/promo-card';
import PromoCardCTA from 'calypso/components/promo-section/promo-card/cta';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { useGetProductVariants } from '../../hooks/product-variants';
import { getItemVariantDiscountPercentage } from '../item-variation-picker/util';
import type { FC } from 'react';

import './style.scss';

const debug = debugFactory( 'calypso:checkout-sidebar-plan-upsell' );

interface UpsellLineProps {
	label: string;
	value?: string;
	boldLabel?: boolean;
	boldValue?: boolean;
	isTitle?: boolean;
}

const UpsellLine: FC< UpsellLineProps > = ( {
	label,
	value,
	boldLabel = false,
	boldValue = false,
	isTitle = false,
} ) => {
	const labelMarkup = boldLabel ? <strong>{ label }</strong> : label;
	const valueMarkup = boldValue ? <strong>{ value }</strong> : value;
	return (
		<>
			<div
				className={ classNames(
					'checkout-sidebar-plan-upsell__plan-grid-cell',
					isTitle ? 'section-title' : ''
				) }
			>
				{ labelMarkup }
			</div>
			<div
				className={ classNames(
					'checkout-sidebar-plan-upsell__plan-grid-cell',
					isTitle ? 'section-title' : ''
				) }
			>
				{ valueMarkup }
			</div>
		</>
	);
};

const JetpackAkismetCheckoutSidebarPlanUpsell: FC = () => {
	const { formStatus } = useFormStatus();
	const isFormLoading = FormStatus.READY !== formStatus;
	const reduxDispatch = useDispatch();
	const { __ } = useI18n();
	const cartKey = useCartKey();
	const { responseCart, replaceProductInCart } = useShoppingCart( cartKey );
	const plan = responseCart.products.find(
		( product ) =>
			isJetpackProduct( product ) || isJetpackPlan( product ) || isAkismetProduct( product )
	);

	const variants = useGetProductVariants( plan );

	if ( ! plan ) {
		debug( 'no jetpack plan found in cart' );
		return null;
	}

	const currentVariant = variants?.find( ( product ) => product.productId === plan.product_id );
	const biennialVariant = variants?.find( ( product ) => product.termIntervalInMonths === 24 );

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
			recordTracksEvent( 'calypso_jetpack_checkout_sidebar_upsell_click', {
				upsell_type: 'biennial-plan',
				switching_from: plan.product_slug,
				switching_to: newPlan.product_slug,
			} )
		);
		replaceProductInCart( plan.uuid, newPlan );
	};

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
	const currencyConfig = {
		stripZeros: true,
		isSmallestUnit: true,
	};

	const cardTitle = createInterpolateElement(
		sprintf(
			// translators: "percentSavings" is the savings percentage for the upgrade as a number, like '20' for '20%'.
			__( '<strong>Save %(percentSavings)d%%</strong> by paying for two years' ),
			{ percentSavings }
		),
		{ strong: <strong /> }
	);

	const yearOnePrice = isComparisonWithIntroOffer
		? currentVariant.priceInteger
		: currentVariant.priceBeforeDiscounts;

	const yearTwoPrice = currentVariant.priceBeforeDiscounts;

	const twoYearTotal =
		currentVariant.priceBeforeDiscounts +
		( isComparisonWithIntroOffer
			? currentVariant.priceInteger
			: currentVariant.priceBeforeDiscounts );

	const twoYearTotalBiennial = biennialVariant.priceInteger;

	// We don't want to call out the two year plan if it doesn't save them money
	if ( twoYearTotal <= twoYearTotalBiennial ) {
		return null;
	}

	return (
		<PromoCard title={ cardTitle } className="checkout-sidebar-plan-upsell jetpack">
			<div className="checkout-sidebar-plan-upsell__plan-grid">
				<UpsellLine label={ __( 'Yearly plan' ) } boldLabel isTitle />

				<UpsellLine
					label={ __( 'Year One' ) }
					value={ formatCurrency( yearOnePrice, currentVariant.currency, currencyConfig ) }
				/>

				<UpsellLine
					label={ __( 'Year Two' ) }
					value={ formatCurrency( yearTwoPrice, currentVariant.currency, currencyConfig ) }
				/>

				<UpsellLine
					label={ __( 'Total' ) }
					value={ formatCurrency( twoYearTotal, currentVariant.currency, currencyConfig ) }
					boldValue
				/>

				<UpsellLine label={ __( 'Two-year plan' ) } boldLabel isTitle />

				<UpsellLine
					label={ __( 'Two-year total' ) }
					value={ formatCurrency( twoYearTotalBiennial, biennialVariant.currency, currencyConfig ) }
					boldValue
				/>
			</div>

			<PromoCardCTA
				cta={ {
					disabled: isFormLoading,
					busy: isFormLoading,
					text: __( 'Switch to a two-year plan' ),
					action: onUpgradeClick,
				} }
			/>
		</PromoCard>
	);
};

export default JetpackAkismetCheckoutSidebarPlanUpsell;
