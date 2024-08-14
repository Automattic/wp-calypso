import {
	isBiennially,
	isDIFMProduct,
	isMonthlyProduct,
	isTriennially,
	isYearly,
} from '@automattic/calypso-products';
import { FormStatus, useFormStatus, Button } from '@automattic/composite-checkout';
import formatCurrency from '@automattic/format-currency';
import {
	type ResponseCart,
	type RemoveCouponFromCart,
	type ResponseCartProduct,
	useShoppingCart,
} from '@automattic/shopping-cart';
import {
	LineItemPrice,
	doesIntroductoryOfferHaveDifferentTermLengthThanProduct,
	doesIntroductoryOfferHavePriceIncrease,
	filterCostOverridesForLineItem,
	getLabel,
	isOverrideCodeIntroductoryOffer,
} from '@automattic/wpcom-checkout';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { useExperiment } from 'calypso/lib/explat';
import { useSelector } from 'calypso/state';
import { getIsOnboardingAffiliateFlow } from 'calypso/state/signup/flow/selectors';
import useCartKey from '../../use-cart-key';
import { getAffiliateCouponLabel, getCouponLabel } from '../../utils';
import type { Theme } from '@automattic/composite-checkout';
import type { LineItemCostOverrideForDisplay } from '@automattic/wpcom-checkout';

const CostOverridesListStyle = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	font-size: 12px;
	font-weight: 400;
	gap: 2px;

	& .cost-overrides-list-item {
		display: grid;
		justify-content: space-between;
		grid-template-columns: auto auto;
		gap: 0 16px;
	}

	& .cost-overrides-list-item__actions {
		grid-column: 1 / span 2;
		display: flex;
		justify-content: flex-end;
	}

	& .cost-overrides-list-item__actions-remove {
		color: #787c82;
	}

	& .cost-overrides-list-item__reason--is-discount {
		color: #008a20;
	}

	& .cost-overrides-list-item__discount {
		white-space: nowrap;
	}
`;

const DeleteButton = styled( Button )< { theme?: Theme } >`
	width: auto;
	font-size: '12px';
	color: ${ ( props ) => props.theme.colors.textColorLight };
`;

/**
 * Introductory offers sometimes have complex pricing plans that are not easy
 * to display as a simple discount. This component displays more details about
 * certain offers.
 */
function LineItemIntroOfferCostOverrideDetail( {
	product,
	costOverride,
}: {
	product: ResponseCartProduct;
	costOverride: LineItemCostOverrideForDisplay;
} ) {
	const cartKey = useCartKey();
	const { responseCart } = useShoppingCart( cartKey );
	const translate = useTranslate();
	if ( ! product.introductory_offer_terms?.enabled ) {
		return null;
	}

	if ( ! isOverrideCodeIntroductoryOffer( costOverride.overrideCode ) ) {
		return false;
	}

	// We only want to display this info for introductory offers which have
	// pricing that is difficult to display as a simple discount. Currently
	// that is offers with different term lengths or price increases.
	if (
		! doesIntroductoryOfferHaveDifferentTermLengthThanProduct(
			product.cost_overrides,
			product.introductory_offer_terms,
			product.months_per_bill_period
		) &&
		! doesIntroductoryOfferHavePriceIncrease( product )
	) {
		return null;
	}

	// Introductory offer manual renewals often have prorated prices that are
	// difficult to display as a simple discount so we keep their display
	// simple.
	if ( product.is_renewal ) {
		return null;
	}

	const tosData = responseCart.terms_of_service?.find( ( tos ) => {
		if ( ! new RegExp( `product_id:${ product.product_id }` ).test( tos.key ) ) {
			return false;
		}
		if ( product.meta && ! new RegExp( `meta:${ product.meta }` ).test( tos.key ) ) {
			return false;
		}
		return true;
	} )?.args;
	const dueDate =
		tosData && 'subscription_auto_renew_date' in tosData
			? tosData.subscription_auto_renew_date
			: undefined;
	const dueAmount = tosData?.renewal_price_integer;
	const renewAmount = tosData?.regular_renewal_price_integer;
	const dueTodayAmount =
		product.cost_overrides?.find(
			( override ) => override.override_code === costOverride.overrideCode
		)?.new_subtotal_integer ?? product.item_subtotal_integer;
	if ( ! dueDate || ! dueAmount || ! renewAmount ) {
		return null;
	}

	const shouldShowDueDate = doesIntroductoryOfferHaveDifferentTermLengthThanProduct(
		product.cost_overrides,
		product.introductory_offer_terms,
		product.months_per_bill_period
	);

	return (
		<div>
			<div>
				{ translate( 'Due today: %(price)s', {
					args: {
						price: formatCurrency( dueTodayAmount, product.currency, {
							isSmallestUnit: true,
							stripZeros: true,
						} ),
					},
				} ) }
			</div>
			<div>
				{ shouldShowDueDate &&
					translate( 'Billed %(dueDate)s: %(price)s', {
						args: {
							dueDate: new Date( dueDate ).toLocaleDateString( undefined, {
								dateStyle: 'long',
							} ),
							price: formatCurrency( dueAmount, product.currency, {
								isSmallestUnit: true,
								stripZeros: true,
							} ),
						},
					} ) }
			</div>
			<div>
				<IntroOfferBillingInterval product={ product } />{ ' ' }
				<span>
					{ formatCurrency( renewAmount, product.currency, {
						isSmallestUnit: true,
						stripZeros: true,
					} ) }
				</span>
			</div>
		</div>
	);
}

export function IntroOfferBillingInterval( { product }: { product: ResponseCartProduct } ) {
	const translate = useTranslate();

	if ( isDIFMProduct( product ) ) {
		return <span>{ translate( 'One-time fee' ) }</span>;
	}

	if ( product.is_included_for_100yearplan ) {
		return null;
	}

	if ( isMonthlyProduct( product ) ) {
		return <span>{ translate( 'Billed every month' ) }</span>;
	}

	if ( isYearly( product ) ) {
		return <span>{ translate( 'Billed every year' ) }</span>;
	}

	if ( isBiennially( product ) ) {
		return <>{ translate( 'Billed every two years' ) }</>;
	}

	if ( isTriennially( product ) ) {
		return <>{ translate( 'Billed every three years' ) }</>;
	}
}

function LineItemCostOverride( {
	costOverride,
	product,
}: {
	costOverride: LineItemCostOverrideForDisplay;
	product: ResponseCartProduct;
} ) {
	const isPriceIncrease = doesIntroductoryOfferHavePriceIncrease( product );
	if ( isPriceIncrease ) {
		return (
			<div className="cost-overrides-list-item" key={ costOverride.humanReadableReason }>
				<LineItemIntroOfferCostOverrideDetail product={ product } costOverride={ costOverride } />
			</div>
		);
	}
	return (
		<div className="cost-overrides-list-item" key={ costOverride.humanReadableReason }>
			<span className="cost-overrides-list-item__reason cost-overrides-list-item__reason--is-discount">
				{ costOverride.humanReadableReason }
			</span>
			<span className="cost-overrides-list-item__discount">
				{ costOverride.discountAmount &&
					formatCurrency( -costOverride.discountAmount, product.currency, {
						isSmallestUnit: true,
						signForPositive: true,
					} ) }
			</span>
			<LineItemIntroOfferCostOverrideDetail product={ product } costOverride={ costOverride } />
		</div>
	);
}

export function LineItemCostOverrides( {
	costOverridesList,
	product,
}: {
	costOverridesList: LineItemCostOverrideForDisplay[];
	product: ResponseCartProduct;
} ) {
	return (
		<CostOverridesListStyle>
			{ costOverridesList.map( ( costOverride ) => (
				<LineItemCostOverride
					product={ product }
					costOverride={ costOverride }
					key={ costOverride.humanReadableReason }
				/>
			) ) }
		</CostOverridesListStyle>
	);
}

const ProductsAndCostOverridesListWrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 1em;
`;

const SingleProductAndCostOverridesListWrapper = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	font-size: 12px;
	font-weight: 400;
	gap: 2px;
`;

const ProductTitleAreaForCostOverridesList = styled.div`
	word-break: break-word;
	font-size: 14px;
	display: flex;
	justify-content: space-between;
	gap: 0.5em;

	& .cost-overrides-list-product__title {
		flex: 1 1 min-content;
	}
`;

function SingleProductAndCostOverridesList( { product }: { product: ResponseCartProduct } ) {
	const translate = useTranslate();
	const costOverridesList = filterCostOverridesForLineItem( product, translate );
	const label = getLabel( product );
	const actualAmountDisplay = formatCurrency(
		product.item_original_subtotal_integer,
		product.currency,
		{
			isSmallestUnit: true,
			stripZeros: true,
		}
	);
	return (
		<SingleProductAndCostOverridesListWrapper>
			<ProductTitleAreaForCostOverridesList>
				<span className="cost-overrides-list-product__title">{ label }</span>
				<LineItemPrice actualAmount={ actualAmountDisplay } />
			</ProductTitleAreaForCostOverridesList>
			<LineItemCostOverrides product={ product } costOverridesList={ costOverridesList } />
		</SingleProductAndCostOverridesListWrapper>
	);
}

export function CouponCostOverride( {
	responseCart,
	removeCoupon,
}: {
	responseCart: ResponseCart;
	removeCoupon?: RemoveCouponFromCart;
} ) {
	const translate = useTranslate();
	const { formStatus } = useFormStatus();
	const isDisabled = formStatus !== FormStatus.READY;
	const isOnboardingAffiliateFlow = useSelector( getIsOnboardingAffiliateFlow );
	const [ , experimentAssignment ] = useExperiment( 'calypso_hide_coupon_box' );

	if ( ! responseCart.coupon || ! responseCart.coupon_savings_total_integer ) {
		return null;
	}

	// translators: The label of the coupon line item in checkout, including the coupon coden
	const couponLabel = translate( 'Coupon: %(couponCode)s', {
		args: { couponCode: responseCart.coupon },
	} );

	const label = isOnboardingAffiliateFlow
		? getAffiliateCouponLabel()
		: getCouponLabel( couponLabel as string, experimentAssignment?.variationName || null );
	return (
		<CostOverridesListStyle>
			<div className="cost-overrides-list-item cost-overrides-list-item--coupon">
				<span className="cost-overrides-list-item__reason cost-overrides-list-item__reason--is-discount">
					{ label }
				</span>
				<span className="cost-overrides-list-item__discount">
					{ formatCurrency( -responseCart.coupon_savings_total_integer, responseCart.currency, {
						isSmallestUnit: true,
					} ) }
				</span>
			</div>
			{ removeCoupon && (
				<span className="cost-overrides-list-item__actions">
					<DeleteButton
						buttonType="text-button"
						disabled={ isDisabled }
						className="cost-overrides-list-item__actions-remove"
						onClick={ removeCoupon }
						aria-label={ translate( 'Remove coupon' ) }
					>
						{ translate( 'Remove' ) }
					</DeleteButton>
				</span>
			) }
		</CostOverridesListStyle>
	);
}

export function ProductsAndCostOverridesList( { responseCart }: { responseCart: ResponseCart } ) {
	return (
		<ProductsAndCostOverridesListWrapper>
			{ responseCart.products.map( ( product ) => (
				<SingleProductAndCostOverridesList product={ product } key={ product.uuid } />
			) ) }
			<CouponCostOverride responseCart={ responseCart } />
		</ProductsAndCostOverridesListWrapper>
	);
}
