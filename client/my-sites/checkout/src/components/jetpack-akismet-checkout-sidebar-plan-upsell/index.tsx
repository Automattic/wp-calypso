import { isAkismetProduct, isJetpackPlan, isJetpackProduct } from '@automattic/calypso-products';
import { FormStatus, useFormStatus } from '@automattic/composite-checkout';
import { formatCurrency } from '@automattic/format-currency';
import { ResponseCartProduct, useShoppingCart } from '@automattic/shopping-cart';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import classNames from 'classnames';
import debugFactory from 'debug';
import { useCallback, type FC } from 'react';
import PromoCard from 'calypso/components/promo-section/promo-card';
import PromoCardCTA from 'calypso/components/promo-section/promo-card/cta';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { useGetProductVariants } from '../../hooks/product-variants';
import { getItemVariantDiscountPercentage } from '../item-variation-picker/util';

import './style.scss';

type PriceBreakdown = {
	label: string;
	priceInteger: number;
	isBold?: boolean;
	isDiscount?: boolean;
	forceDisplay?: boolean;
};

const debug = debugFactory( 'calypso:checkout-sidebar-plan-upsell' );

const isJetpackAkismetProduct = ( product: ResponseCartProduct ) =>
	isJetpackProduct( product ) || isJetpackPlan( product ) || isAkismetProduct( product );

const useCurrentProductWithVariants = () => {
	const cartKey = useCartKey();
	const reduxDispatch = useDispatch();
	const { responseCart, replaceProductInCart } = useShoppingCart( cartKey );
	const product = responseCart.products.find( isJetpackAkismetProduct );
	const variantsArray = useGetProductVariants( product );

	const current = variantsArray?.find( ( variant ) => variant.productId === product?.product_id );
	const biennial = variantsArray?.find( ( variant ) => variant.termIntervalInMonths === 24 );

	const replaceWithBiennial = useCallback( () => {
		if ( ! product || ! current || ! biennial ) {
			return;
		}

		debug( 'switching from', current.productSlug, 'to', biennial.productSlug );
		reduxDispatch(
			recordTracksEvent( 'calypso_jetpack_checkout_sidebar_upsell_click', {
				upsell_type: 'biennial-plan',
				switching_from: current.productSlug,
				switching_to: biennial.productSlug,
			} )
		);

		replaceProductInCart( product.uuid, {
			product_id: biennial.productId,
			product_slug: biennial.productSlug,
		} );
	}, [ product, current, biennial, reduxDispatch, replaceProductInCart ] );

	return {
		product,
		credits: responseCart.credits_integer,
		variants: { current, biennial },
		replaceWithBiennial,
	};
};

const useCalculatedDiscounts = () => {
	const { __ } = useI18n();
	const {
		product,
		credits,
		variants: { current, biennial },
	} = useCurrentProductWithVariants();

	if ( ! product ) {
		return null;
	}

	if ( ! current || ! biennial || current.productId === biennial.productId ) {
		debug( 'product in cart has no biennial variant or is already biennial', {
			current,
			biennial,
		} );
		return null;
	}

	const originalPrice = current.priceBeforeDiscounts * 2;

	const priceBreakdown: PriceBreakdown[] = [];

	priceBreakdown.push( {
		label: __( 'Plan subscription' ),
		priceInteger: originalPrice,
	} );

	// Introductory discount (optional)
	if ( product.introductory_offer_terms?.enabled ) {
		if (
			12 === product.months_per_bill_period &&
			'month' === product.introductory_offer_terms.interval_unit &&
			1 === product.introductory_offer_terms.interval_count
		) {
			// For free monthly trials (for yearly plans), display the monthly price as the discount.
			priceBreakdown.push( {
				label: __( 'Free trial*' ),
				priceInteger: product.item_original_monthly_cost_integer,
				isDiscount: true,
			} );
		} else {
			priceBreakdown.push( {
				label: __( 'Introductory offer*' ),
				priceInteger: current.priceBeforeDiscounts - current.priceInteger,
				isDiscount: true,
			} );
		}
	}

	// Multi-year discount
	const oneYearForTwoYearsPrice =
		current.priceBeforeDiscounts * 2 -
		priceBreakdown
			.filter( ( { isDiscount } ) => isDiscount )
			.reduce( ( sum, discount ) => sum + discount.priceInteger, 0 );

	priceBreakdown.push( {
		label: __( 'Multi-year discount' ),
		priceInteger: oneYearForTwoYearsPrice - biennial.priceInteger,
		isDiscount: true,
	} );

	// Coupon discount is added on top of other discounts
	if ( product.coupon_savings_integer ) {
		const couponRate =
			product.coupon_savings_integer / product.item_subtotal_before_discounts_integer;
		priceBreakdown.push( {
			label: __( 'Coupon' ),
			priceInteger: biennial.priceInteger * couponRate,
			isDiscount: true,
		} );
	}

	const allAppliedDiscounts = priceBreakdown
		.filter( ( { isDiscount } ) => isDiscount )
		.reduce( ( sum, discount ) => sum + discount.priceInteger, 0 );

	const subtotalPrice = originalPrice - allAppliedDiscounts;
	const vatPrice =
		( biennial.priceBeforeDiscounts - allAppliedDiscounts ) * ( product.item_tax_rate ?? 0 );

	priceBreakdown.push( { label: __( 'Tax' ), priceInteger: vatPrice } );

	const finalBreakdown: PriceBreakdown[] = [];

	if ( credits >= subtotalPrice + vatPrice ) {
		priceBreakdown.push( {
			label: __( 'Credits' ),
			priceInteger: -( subtotalPrice + vatPrice ),
		} );
		finalBreakdown.push( {
			label: __( 'Total' ),
			priceInteger: 0,
			isBold: true,
			forceDisplay: true,
		} );
	} else {
		priceBreakdown.push( {
			label: __( 'Credits' ),
			priceInteger: -credits,
		} );
		finalBreakdown.push( {
			label: __( 'Total' ),
			priceInteger: subtotalPrice + vatPrice - credits,
			isBold: true,
		} );
	}

	return {
		percentSavings: getItemVariantDiscountPercentage( biennial, current ),
		priceBreakdown,
		finalBreakdown,
	};
};

const UpsellEntry: FC< Omit< PriceBreakdown, 'priceInteger' > & { priceInteger?: number } > = ( {
	label,
	priceInteger,
	isBold,
	isDiscount,
	forceDisplay,
} ) => {
	const { product } = useCurrentProductWithVariants();
	const className = classNames( 'checkout-sidebar-plan-upsell__plan-grid-cell', {
		'section-bold': isBold,
		'section-discount': isDiscount,
	} );

	if ( 0 === priceInteger && ! forceDisplay ) {
		// If value is defined (it's price entry) but $0, we don't show it.
		return null;
	}

	return (
		<>
			<div className={ className }>{ label }</div>
			{ undefined !== priceInteger && (
				<div className={ className }>
					{ isDiscount ? '-' : '' }
					{ formatCurrency( priceInteger, product?.currency ?? 'USD', { isSmallestUnit: true } ) }
				</div>
			) }
		</>
	);
};

const JetpackAkismetCheckoutSidebarPlanUpsell: FC = () => {
	const { __ } = useI18n();
	const { formStatus } = useFormStatus();
	const { product, replaceWithBiennial } = useCurrentProductWithVariants();
	const calculatedDiscounts = useCalculatedDiscounts();

	if ( ! product || ! calculatedDiscounts ) {
		return null;
	}

	const { percentSavings, priceBreakdown, finalBreakdown } = calculatedDiscounts;

	const isLoading = FormStatus.READY !== formStatus;
	const cardTitle = sprintf(
		// translators: "percentSavings" is the savings percentage for the upgrade as a number, like '20' for '20%'.
		__( 'Save %(percentSavings)d%% by paying for two years.' ),
		{ percentSavings }
	);

	return (
		<PromoCard title={ cardTitle } className="checkout-sidebar-plan-upsell jetpack">
			<div className="checkout-sidebar-plan-upsell__plan-grid">
				<UpsellEntry label={ __( '2 year plan' ) } isBold />
			</div>
			<hr className="checkout-sidebar-plan-upsell__separator" />
			<div className="checkout-sidebar-plan-upsell__plan-grid">
				{ priceBreakdown.map( ( props ) => (
					<UpsellEntry key={ props.label } { ...props } />
				) ) }
			</div>
			<hr className="checkout-sidebar-plan-upsell__separator" />
			<div className="checkout-sidebar-plan-upsell__plan-grid">
				{ finalBreakdown.map( ( props ) => (
					<UpsellEntry key={ props.label } { ...props } />
				) ) }
			</div>
			<PromoCardCTA
				cta={ {
					disabled: isLoading,
					busy: isLoading,
					text: __( 'Switch to a two-year plan' ),
					action: replaceWithBiennial,
				} }
			/>
		</PromoCard>
	);
};

export default JetpackAkismetCheckoutSidebarPlanUpsell;
