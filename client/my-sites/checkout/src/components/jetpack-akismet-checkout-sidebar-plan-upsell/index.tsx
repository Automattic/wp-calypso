import { isAkismetProduct, isJetpackPlan, isJetpackProduct } from '@automattic/calypso-products';
import { FormStatus, useFormStatus } from '@automattic/composite-checkout';
import { formatCurrency } from '@automattic/number-formatters';
import { ResponseCartProduct, useShoppingCart } from '@automattic/shopping-cart';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import debugFactory from 'debug';
import { useCallback, type FC, useMemo } from 'react';
import PromoCard from 'calypso/components/promo-section/promo-card';
import PromoCardCTA from 'calypso/components/promo-section/promo-card/cta';
import { preventWidows } from 'calypso/lib/formatting';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { useGetProductVariants } from '../../hooks/product-variants';
import { getItemVariantDiscount } from '../item-variation-picker/util';

import './style.scss';

type PriceBreakdown = {
	label: string;
	priceInteger: number;
	isBold?: boolean;
	isDiscount?: boolean;
	forceDisplay?: boolean;
	isIntroductoryOffer?: boolean;
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
		variants: { current, biennial },
		replaceWithBiennial,
	};
};

const useCalculatedDiscounts = () => {
	const { __ } = useI18n();
	const {
		product,
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
	const introductoryOfferDiscount = biennial.priceBeforeDiscounts - biennial.priceInteger;
	const multiYearDiscount = originalPrice - biennial.priceBeforeDiscounts;
	const additionalDiscount = product.introductory_offer_terms?.enabled
		? 0
		: biennial.priceBeforeDiscounts - biennial.priceInteger; // additional discount for events like Black Friday

	const priceBreakdown: PriceBreakdown[] = [];

	priceBreakdown.push( {
		label: __( 'Plan subscription' ),
		priceInteger: originalPrice,
	} );

	// Introductory discount (optional)
	if ( product.introductory_offer_terms?.enabled ) {
		const isProductFreeTrial =
			product.bill_period === '365' &&
			product.introductory_offer_terms?.interval_unit === 'month' &&
			product.introductory_offer_terms?.interval_count === 1;
		if ( 'month' === biennial.introductoryTerm && 1 === biennial.introductoryInterval ) {
			// For free monthly trials (biennial), display the monthly price as the discount.
			priceBreakdown.push( {
				label: __( 'Free trial*' ),
				priceInteger: product.item_original_monthly_cost_integer,
				isDiscount: true,
				isIntroductoryOffer: true,
			} );
		} else if ( ! isProductFreeTrial ) {
			// We don't show the discount for free trials (annual) in upsell if biennial plan doesn't have free trial.
			priceBreakdown.push( {
				label: __( 'Introductory offer*' ),
				priceInteger: introductoryOfferDiscount,
				isDiscount: true,
				isIntroductoryOffer: true,
			} );
		}
	}

	if ( multiYearDiscount > 0 ) {
		priceBreakdown.push( {
			label: __( 'Multi-year discount' ),
			priceInteger: multiYearDiscount,
			isDiscount: true,
		} );
	}

	if ( additionalDiscount > 0 ) {
		priceBreakdown.push( {
			label: __( 'Additional discount' ),
			priceInteger: additionalDiscount,
			isDiscount: true,
		} );
	}

	// Coupon discount is added on top of other discounts
	if ( product.coupon_savings_integer ) {
		const couponRate = product.coupon_savings_integer / product.item_original_subtotal_integer;
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

	const vatPrice = ( originalPrice - allAppliedDiscounts ) * ( product.item_tax_rate ?? 0 );

	priceBreakdown.push( { label: __( 'Tax' ), priceInteger: vatPrice } );

	const finalBreakdown: PriceBreakdown[] = [
		{
			label: __( 'Total' ),
			priceInteger: subtotalPrice + vatPrice,
			isBold: true,
		},
	];

	return {
		percentSavings: getItemVariantDiscount( biennial, current ),
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
	const className = clsx( 'checkout-sidebar-plan-upsell__plan-grid-cell', {
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
					{ formatCurrency( Math.round( priceInteger ), product?.currency ?? 'USD', {
						isSmallestUnit: true,
					} ) }
				</div>
			) }
		</>
	);
};

const IntroductoryOfferAsterisk: FC< { renewalsCount: number } > = ( { renewalsCount } ) => {
	const { __, _n } = useI18n();
	const description = useMemo( () => {
		if ( renewalsCount > 0 ) {
			return sprintf(
				// translators: %d is the number of renewals after the introductory offer.
				_n(
					'*Introductory offer first term and %d renewal only, then renews at regular rate.',
					'*Introductory offer first term and %d renewals only, then renews at regular rate.',
					renewalsCount
				),
				renewalsCount
			);
		}

		return __( '*Introductory offer first term only, renews at regular rate.' );
	}, [ renewalsCount, __, _n ] );

	return <>{ preventWidows( description ) }</>;
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

	if ( percentSavings <= 0 ) {
		return null;
	}

	const hasIntroductoryOffers = priceBreakdown.some(
		( breakdown ) => breakdown.isIntroductoryOffer
	);

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
			{ hasIntroductoryOffers && product.introductory_offer_terms && (
				<IntroductoryOfferAsterisk
					renewalsCount={ product.introductory_offer_terms.transition_after_renewal_count }
				/>
			) }

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
