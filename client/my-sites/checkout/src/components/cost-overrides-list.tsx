import config from '@automattic/calypso-config';
import {
	isBiennially,
	isDIFMProduct,
	isMonthlyProduct,
	isTriennially,
	isYearly,
} from '@automattic/calypso-products';
import colorStudio from '@automattic/color-studio';
import { FormStatus, useFormStatus, Button } from '@automattic/composite-checkout';
import { formatCurrency } from '@automattic/number-formatters';
import {
	type ResponseCart,
	type RemoveCouponFromCart,
	type ResponseCartProduct,
	useShoppingCart,
} from '@automattic/shopping-cart';
import {
	doesIntroductoryOfferHaveDifferentTermLengthThanProduct,
	doesIntroductoryOfferHavePriceIncrease,
	filterCostOverridesForLineItem,
	getLabel,
	groupBundleLineItems,
	isOverrideCodeIntroductoryOffer,
} from '@automattic/wpcom-checkout';
import styled from '@emotion/styled';
import { getQueryArg } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import useEquivalentMonthlyTotals, {
	getSimulatedCostBeforeDiscounts,
} from 'calypso/my-sites/checkout/utils/use-equivalent-monthly-totals';
import { useSelector } from 'calypso/state';
import {
	getIsOnboardingAffiliateFlow,
	getIsOnboardingUnifiedFlow,
} from 'calypso/state/signup/flow/selectors';
import useCartKey from '../../use-cart-key';
import { getAffiliateCouponLabel } from '../../utils';
import { CheckIcon } from './check-icon';
import type { Theme } from '@automattic/composite-checkout';
import type {
	CartBundleLineItem,
	LineItemCostOverrideForDisplay,
} from '@automattic/wpcom-checkout';

const PALETTE = colorStudio.colors;
const COLOR_GRAY_40 = PALETTE[ 'Gray 40' ];
const COLOR_GREEN_60 = PALETTE[ 'Green 60' ];

const CostOverridesListStyle = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	font-size: 12px;
	font-weight: 400;
	gap: 2px;
	position: relative;

	&:has( svg ) {
		padding-left: 24px;
	}

	.rtl &:has( svg ) {
		padding-right: 24px;
		padding-left: 0;
	}

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
		color: ${ COLOR_GRAY_40 };
	}

	& .cost-overrides-list-item__reason--is-discount {
		color: ${ COLOR_GREEN_60 };
	}

	& .cost-overrides-list-item__discount {
		white-space: nowrap;
	}

	&:has( svg ) .cost-overrides-list-item__discount {
		color: ${ COLOR_GREEN_60 };
		font-weight: 500;
	}
`;

const DeleteButton = styled( Button )< { theme?: Theme } >`
	width: auto;
	font-size: '12px';
	color: ${ ( props ) => props.theme.colors.textColorLight };
`;

function doesIntroOfferUseDetailDisplay( product: ResponseCartProduct ): boolean {
	return (
		doesIntroductoryOfferHaveDifferentTermLengthThanProduct(
			product.cost_overrides,
			product.introductory_offer_terms,
			product.months_per_bill_period
		) || doesIntroductoryOfferHavePriceIncrease( product )
	);
}

function getTosDataForProduct( product: ResponseCartProduct, responseCart: ResponseCart ) {
	return responseCart.terms_of_service?.find( ( tos ) => {
		if ( ! new RegExp( `product_id:${ product.product_id }` ).test( tos.key ) ) {
			return false;
		}
		if ( product.meta && ! new RegExp( `meta:${ product.meta }` ).test( tos.key ) ) {
			return false;
		}
		return true;
	} )?.args;
}

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
		return null;
	}

	// We only want to display this info for introductory offers which have
	// pricing that is difficult to display as a simple discount. Currently
	// that is offers with different term lengths or price increases.
	if ( ! doesIntroOfferUseDetailDisplay( product ) ) {
		return null;
	}

	// Introductory offer manual renewals often have prorated prices that are
	// difficult to display as a simple discount so we keep their display
	// simple.
	if ( product.is_renewal ) {
		return null;
	}

	const tosData = getTosDataForProduct( product, responseCart );
	const dueDate =
		tosData && 'subscription_auto_renew_date' in tosData
			? tosData.subscription_auto_renew_date
			: undefined;
	const dueAmount = tosData?.renewal_price_integer;
	const renewAmount = tosData?.regular_renewal_price_integer;
	const dueTodayAmount = product.item_subtotal_integer;
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
	shouldShowDiscount,
}: {
	costOverride: LineItemCostOverrideForDisplay;
	product: ResponseCartProduct;
	shouldShowDiscount: boolean;
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
					shouldShowDiscount &&
					formatCurrency( -costOverride.discountAmount, product.currency, {
						isSmallestUnit: true,
						signForPositive: true, // TODO clk numberFormatCurrency signForPositive only usage
					} ) }
			</span>
			<LineItemIntroOfferCostOverrideDetail product={ product } costOverride={ costOverride } />
		</div>
	);
}

export function LineItemCostOverrides( {
	costOverridesList,
	product,
	shouldShowDiscount,
}: {
	costOverridesList: LineItemCostOverrideForDisplay[];
	product: ResponseCartProduct;
	shouldShowDiscount: boolean;
} ) {
	return (
		<CostOverridesListStyle>
			{ costOverridesList.map( ( costOverride ) => (
				<LineItemCostOverride
					product={ product }
					costOverride={ costOverride }
					shouldShowDiscount={ shouldShowDiscount }
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

const SimplifiedSingleProductAndCostOverridesListWrapper = styled(
	SingleProductAndCostOverridesListWrapper
)`
	padding-left: 24px;
	position: relative;

	.rtl & {
		padding-right: 24px;
		padding-left: 0;
	}
`;

const SimplifiedLineItemPriceWrapper = styled.span`
	display: flex;
	flex: 0 0 auto;
	gap: 4px;
	margin-left: 12px;
	font-size: inherit;

	.rtl & {
		margin-right: 12px;
		margin-left: 0;
	}

	& s {
		color: ${ COLOR_GRAY_40 };
	}

	& span {
		font-weight: 500;
	}
`;

const SimplifiedLineItemPrice = function ( {
	actualAmount,
	crossedOutAmount,
}: {
	actualAmount?: string;
	crossedOutAmount?: string;
} ) {
	return (
		<SimplifiedLineItemPriceWrapper>
			{ crossedOutAmount && <s>{ crossedOutAmount }</s> }
			<span>{ actualAmount }</span>
		</SimplifiedLineItemPriceWrapper>
	);
};

const WPCheckoutCheckIcon = styled( CheckIcon )`
	fill: ${ ( props ) => props.theme.colors.success };
	margin-right: 4px;
	position: absolute;
	top: 0;
	left: 0;

	.rtl & {
		margin-right: 0;
		margin-left: 4px;
		right: 0;
		left: auto;
	}
`;

/**
 * For intro offers whose pricing is simple enough not to need a detail
 * breakdown, determine the crossed-out price to display. Returns the simulated
 * pre-discount price if it's higher than the renewal price, otherwise
 * undefined.
 */
function getIntroOfferCrossedOutPrice(
	renewalPrice: number,
	simulatedPriceBeforeDiscounts: number
): number | undefined {
	return renewalPrice < simulatedPriceBeforeDiscounts ? simulatedPriceBeforeDiscounts : undefined;
}

/**
 * Return the item subtotal with the coupon discount added back. Since coupon
 * discounts are displayed as a dedicated line item (via CouponCostOverride),
 * we strip them from the per-product price to avoid showing the discount twice.
 */
function getItemSubtotalExcludingCoupon( product: ResponseCartProduct ): number {
	const couponOverride = product.cost_overrides.find(
		( override ) => override.override_code === 'coupon-discount'
	);
	const couponDiscountAmount = couponOverride
		? couponOverride.old_subtotal_integer - couponOverride.new_subtotal_integer
		: 0;
	return product.item_subtotal_integer + couponDiscountAmount;
}

/**
 * Return two formatted prices. `actualAmountDisplay` should be the final
 * subtotal after all cost overrides are applied. `crossedOutAmountDisplay`
 * should be the price before cost overrides, but only if it's higher (some
 * cost overrides can _increase_ the price).
 *
 * There are also several cases where actualAmountDisplay will be the renewal
 * price instead (see inline comments).
 *
 * `crossedOutAmountDisplay` (the amount before discounts) may also be
 * _increased_ by an amount as if the original cost of the product was 12 times
 * the product's monthly cost. This simulates a discount granted by purchasing
 * an annual version of the product, but it's not a "real" discount in the
 * sense that no price changes were applied to the annual product in that case;
 * it's just the result of comparing the prices of the annual to the monthly
 * product.
 */
function getLineItemPriceDisplay(
	product: ResponseCartProduct,
	responseCart: ResponseCart,
	monthlyPrices: Record< string, number >
): { actualAmountDisplay: string; crossedOutAmountDisplay: string | undefined } {
	const fmt = ( amount: number ) =>
		formatCurrency( amount, product.currency, { isSmallestUnit: true, stripZeros: true } );

	// This is the simulated cost before cost overrides. It's similar to
	// cost before cost overrides but it may include an increase based on the
	// monthly cost of a related product in the same tier (eg: it will be 12
	// times the cost of the monthly version of the same plan, if one exists).
	const simulatedPriceBeforeDiscounts = getSimulatedCostBeforeDiscounts( product, monthlyPrices );

	const isIntroOffer = product.cost_overrides.some( ( override ) =>
		isOverrideCodeIntroductoryOffer( override.override_code )
	);
	// When LineItemIntroOfferCostOverrideDetail renders (different term length or
	// price increase), it already displays the full pricing breakdown, so we fall
	// through to the regular logic below.
	if ( isIntroOffer && ! doesIntroOfferUseDetailDisplay( product ) ) {
		// For an introductory offer, show the recurring amount as the amount the user will pay and include the
		// simulated amount as the crossed-out number if it is greater.
		const tosData = getTosDataForProduct( product, responseCart );
		if ( tosData ) {
			const renewalPrice = tosData.regular_renewal_price_integer;
			const crossedOutPrice = getIntroOfferCrossedOutPrice(
				renewalPrice,
				simulatedPriceBeforeDiscounts
			);
			return {
				actualAmountDisplay: fmt( renewalPrice ),
				crossedOutAmountDisplay: crossedOutPrice ? fmt( crossedOutPrice ) : undefined,
			};
		}
	}

	// When the simulated price comes from the monthly equivalent, show the
	// product's own original cost as the actual amount and the monthly-based
	// simulated price as the crossed-out number (if greater).
	if ( simulatedPriceBeforeDiscounts !== product.item_original_subtotal_integer ) {
		const isDiscounted = product.item_original_subtotal_integer < simulatedPriceBeforeDiscounts;
		return {
			actualAmountDisplay: fmt( product.item_original_subtotal_integer ),
			crossedOutAmountDisplay: isDiscounted ? fmt( simulatedPriceBeforeDiscounts ) : undefined,
		};
	}

	// Show the actual amount as the amount the user will pay (before coupon) and
	// include the amount before cost overrides as the crossed-out number if it is
	// greater.
	const itemSubtotalWithoutCoupon = getItemSubtotalExcludingCoupon( product );
	const isDiscounted = itemSubtotalWithoutCoupon < simulatedPriceBeforeDiscounts;
	return {
		actualAmountDisplay: fmt( itemSubtotalWithoutCoupon ),
		crossedOutAmountDisplay: isDiscounted ? fmt( simulatedPriceBeforeDiscounts ) : undefined,
	};
}

function SingleProductAndCostOverridesList( {
	product,
	responseCart,
}: {
	product: ResponseCartProduct;
	responseCart: ResponseCart;
} ) {
	const translate = useTranslate();
	const costOverridesList = filterCostOverridesForLineItem( product, translate );
	const label = getLabel( product );

	const monthlyPrices = useEquivalentMonthlyTotals( [ product ] );

	const { actualAmountDisplay, crossedOutAmountDisplay } = getLineItemPriceDisplay(
		product,
		responseCart,
		monthlyPrices
	);

	// Show the discount amount when the crossed-out price is simulated from the
	// monthly equivalent, or when there's an introductory offer.
	const shouldShowDiscount =
		getSimulatedCostBeforeDiscounts( product, monthlyPrices ) !==
			product.item_original_subtotal_integer ||
		product.cost_overrides.some( ( override ) =>
			isOverrideCodeIntroductoryOffer( override.override_code )
		);

	return (
		<SimplifiedSingleProductAndCostOverridesListWrapper className="cost-overrides-list-product-wrapper">
			<WPCheckoutCheckIcon />
			<ProductTitleAreaForCostOverridesList>
				<span className="cost-overrides-list-product__title">{ label }</span>
				<SimplifiedLineItemPrice
					actualAmount={ actualAmountDisplay }
					crossedOutAmount={ crossedOutAmountDisplay }
				/>
			</ProductTitleAreaForCostOverridesList>
			<LineItemCostOverrides
				product={ product }
				costOverridesList={ costOverridesList }
				shouldShowDiscount={ shouldShowDiscount }
			/>
		</SimplifiedSingleProductAndCostOverridesListWrapper>
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
	const isOnboardingUnifiedFlow = useSelector( getIsOnboardingUnifiedFlow );
	const isBFref =
		typeof window !== 'undefined' &&
		getQueryArg( window.location.href, 'ref' ) === 'black-friday-2025-lp';

	if ( ! responseCart.coupon || ! responseCart.coupon_savings_total_integer ) {
		return null;
	}

	// translators: The label of the coupon line item in checkout, including the coupon code
	const couponLabel = translate( 'Coupon: %(couponCode)s', {
		args: { couponCode: responseCart.coupon },
	} );

	const label =
		isBFref || isOnboardingAffiliateFlow || isOnboardingUnifiedFlow
			? getAffiliateCouponLabel()
			: couponLabel;
	return (
		<CostOverridesListStyle>
			<WPCheckoutCheckIcon />
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

const BundleMemberList = styled.div`
	display: flex;
	flex-direction: column;
	font-size: 12px;
	font-weight: 400;
	gap: 2px;

	& .cost-overrides-list-bundle-member {
		display: flex;
		justify-content: space-between;
		gap: 0 16px;
	}
`;

/**
 * Render a domain bundle as a single compact row in the order summary, mirroring
 * the order-review surface's `BundleLineItem`: a "Domain bundle" title with the
 * summed bundle total, and each member domain listed beneath with its own price.
 * The presentation matches the summary's other product rows (green check icon,
 * label-and-price header) rather than reusing the heavier review component.
 */
export function BundleProductAndCostOverridesList( { bundle }: { bundle: CartBundleLineItem } ) {
	const translate = useTranslate();
	const { products } = bundle;
	// All members of a bundle share a currency, so the total can safely be summed
	// in the smallest unit and rendered under the first member's currency.
	const currency = products[ 0 ]?.currency ?? 'USD';
	// Strip per-member coupon discounts before summing. The order summary shows
	// coupon savings on a dedicated CouponCostOverride line, so the per-line prices
	// here must reflect the pre-coupon subtotal or the discount is counted twice
	// (this mirrors how getLineItemPriceDisplay renders single products on this
	// surface).
	const bundleTotalInteger = products.reduce(
		( total, product ) => total + getItemSubtotalExcludingCoupon( product ),
		0
	);
	const bundleTotalDisplay = formatCurrency( bundleTotalInteger, currency, {
		isSmallestUnit: true,
		stripZeros: true,
	} );

	return (
		<SimplifiedSingleProductAndCostOverridesListWrapper className="cost-overrides-list-product-wrapper">
			<WPCheckoutCheckIcon />
			<ProductTitleAreaForCostOverridesList>
				<span className="cost-overrides-list-product__title">{ translate( 'Domain bundle' ) }</span>
				<SimplifiedLineItemPrice actualAmount={ bundleTotalDisplay } />
			</ProductTitleAreaForCostOverridesList>
			<BundleMemberList>
				{ products.map( ( product ) => (
					<div className="cost-overrides-list-bundle-member" key={ product.uuid }>
						<span>{ product.meta }</span>
						<span>
							{ formatCurrency( getItemSubtotalExcludingCoupon( product ), product.currency, {
								isSmallestUnit: true,
								stripZeros: true,
							} ) }
						</span>
					</div>
				) ) }
			</BundleMemberList>
		</SimplifiedSingleProductAndCostOverridesListWrapper>
	);
}

export function ProductsAndCostOverridesList( { responseCart }: { responseCart: ResponseCart } ) {
	// Bundle grouping is gated behind the `domain-bundling` feature flag. When off,
	// every product renders on its own line exactly as before.
	const groupedLineItems = config.isEnabled( 'domain-bundling' )
		? groupBundleLineItems( responseCart.products )
		: responseCart.products.map( ( product ) => ( { type: 'product' as const, product } ) );

	return (
		<ProductsAndCostOverridesListWrapper className="wp-checkout-order-summary__products-list">
			{ groupedLineItems.map( ( entry ) => {
				if ( entry.type === 'bundle' ) {
					return (
						<BundleProductAndCostOverridesList
							bundle={ entry }
							key={ `bundle-${ entry.groupId }` }
						/>
					);
				}

				return (
					<SingleProductAndCostOverridesList
						product={ entry.product }
						responseCart={ responseCart }
						key={ entry.product.uuid }
					/>
				);
			} ) }
			<CouponCostOverride responseCart={ responseCart } />
		</ProductsAndCostOverridesListWrapper>
	);
}
