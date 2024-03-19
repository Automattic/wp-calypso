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
	doesIntroductoryOfferHaveDifferentTermLengthThanProduct,
	doesIntroductoryOfferHavePriceIncrease,
} from '@automattic/wpcom-checkout';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import useCartKey from '../../use-cart-key';
import { useCheckoutV2 } from '../hooks/use-checkout-v2';
import type { Theme } from '@automattic/composite-checkout';
import type {
	CostOverrideForDisplay,
	LineItemCostOverrideForDisplay,
} from '@automattic/wpcom-checkout';

const CostOverridesListStyle = styled.div`
	grid-area: discounts;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	font-size: 12px;
	font-weight: 400;

	& .cost-overrides-list-item {
		display: grid;
		justify-content: space-between;
		grid-template-columns: auto auto;
		margin-top: 4px;
		gap: 0 16px;
	}

	& .cost-overrides-list-item--coupon {
		margin-top: 16px;
	}

	& .cost-overrides-list-item:nth-of-type( 1 ) {
		margin-top: 0;
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

const DeleteButton = styled( Button )< { theme?: Theme; shouldUseCheckoutV2: boolean } >`
	width: auto;
	font-size: ${ ( props ) => ( props.shouldUseCheckoutV2 ? '12px' : 'inherit' ) };
	color: ${ ( props ) => props.theme.colors.textColorLight };
`;

export function CostOverridesList( {
	costOverridesList,
	currency,
	removeCoupon,
	couponCode,
	showOnlyCoupons,
}: {
	costOverridesList: Array< CostOverrideForDisplay >;
	currency: string;
	removeCoupon?: RemoveCouponFromCart;
	couponCode: ResponseCart[ 'coupon' ];
	showOnlyCoupons?: boolean;
} ) {
	const shouldUseCheckoutV2 = useCheckoutV2() === 'treatment';

	const translate = useTranslate();
	// Let's put the coupon code last because it will have its own "Remove" button.
	const nonCouponOverrides = costOverridesList.filter(
		( override ) => override.overrideCode !== 'coupon-discount'
	);
	const couponOverrides = costOverridesList.filter(
		( override ) => override.overrideCode === 'coupon-discount'
	);
	const { formStatus } = useFormStatus();
	const isDisabled = formStatus !== FormStatus.READY;
	return (
		<CostOverridesListStyle>
			{ ! showOnlyCoupons &&
				nonCouponOverrides.map( ( costOverride ) => {
					const isPriceIncrease = costOverride.discountAmount < 0;
					return (
						<div className="cost-overrides-list-item" key={ costOverride.humanReadableReason }>
							<span
								className={
									isPriceIncrease
										? 'cost-overrides-list-item__reason'
										: 'cost-overrides-list-item__reason cost-overrides-list-item__reason--is-discount'
								}
							>
								{ costOverride.humanReadableReason }
							</span>
							<span className="cost-overrides-list-item__discount">
								{ formatCurrency( -costOverride.discountAmount, currency, {
									isSmallestUnit: true,
									signForPositive: true,
								} ) }
							</span>
						</div>
					);
				} ) }
			{ ! removeCoupon &&
				couponOverrides.map( ( costOverride ) => {
					return (
						<div className="cost-overrides-list-item" key={ costOverride.humanReadableReason }>
							<span className="cost-overrides-list-item__reason cost-overrides-list-item__reason--is-discount">
								{ couponCode.length > 0
									? translate( 'Coupon: %(couponCode)s', { args: { couponCode } } )
									: costOverride.humanReadableReason }
							</span>
							<span className="cost-overrides-list-item__discount">
								{ formatCurrency( -costOverride.discountAmount, currency, {
									isSmallestUnit: true,
									signForPositive: true,
								} ) }
							</span>
						</div>
					);
				} ) }
			{ removeCoupon &&
				couponOverrides.map( ( costOverride ) => {
					return (
						<div
							className="cost-overrides-list-item cost-overrides-list-item--coupon"
							key={ costOverride.humanReadableReason }
						>
							<span className="cost-overrides-list-item__reason cost-overrides-list-item__reason--is-discount">
								{ couponCode.length > 0
									? translate( 'Coupon: %(couponCode)s', { args: { couponCode } } )
									: costOverride.humanReadableReason }
							</span>
							<span className="cost-overrides-list-item__reason cost-overrides-list-item__reason--is-discount">
								{ formatCurrency( -costOverride.discountAmount, currency, {
									isSmallestUnit: true,
									signForPositive: true,
								} ) }
							</span>
							<span className="cost-overrides-list-item__actions">
								<DeleteButton
									buttonType="text-button"
									disabled={ isDisabled }
									className="cost-overrides-list-item__actions-remove"
									onClick={ removeCoupon }
									aria-label={ translate( 'Remove coupon' ) }
									shouldUseCheckoutV2={ shouldUseCheckoutV2 }
								>
									{ translate( 'Remove' ) }
								</DeleteButton>
							</span>
						</div>
					);
				} ) }
		</CostOverridesListStyle>
	);
}

/**
 * Introductory offers sometimes have complex pricing plans that are not easy
 * to display as a simple discount. This component displays more details about
 * certain offers.
 */
function LineItemIntroOfferCostOverrideDetail( { product }: { product: ResponseCartProduct } ) {
	const cartKey = useCartKey();
	const { responseCart } = useShoppingCart( cartKey );
	const translate = useTranslate();
	if ( ! product.introductory_offer_terms?.enabled ) {
		return null;
	}

	// We only want to display this info for introductory offers which have
	// pricing that is difficult to display as a simple discount. Currently
	// that is offers with different term lengths or price increases.
	if (
		! doesIntroductoryOfferHaveDifferentTermLengthThanProduct( product ) &&
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
	if ( ! dueDate || ! dueAmount || ! renewAmount ) {
		return null;
	}

	const shouldShowDueDate = doesIntroductoryOfferHaveDifferentTermLengthThanProduct( product );

	return (
		<div>
			<div>
				{ translate( 'Due today: %(price)s', {
					args: {
						price: formatCurrency( product.item_subtotal_integer, product.currency, {
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
				<LineItemIntroOfferCostOverrideDetail product={ product } />
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
			<LineItemIntroOfferCostOverrideDetail product={ product } />
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
