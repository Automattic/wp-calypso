import { FormStatus, useFormStatus } from '@automattic/composite-checkout';
import { formatCurrency } from '@automattic/number-formatters';
import { useShoppingCart, type ResponseCart } from '@automattic/shopping-cart';
import {
	filterCostOverridesForLineItem,
	getCouponLineItemFromCart,
	getCreditsLineItemFromCart,
	getLabel,
	getTaxBreakdownLineItemsFromCart,
	getTotalLineItemFromCart,
	isBillingInfoEmpty,
	LineItemBillingInterval,
	LineItemPrice,
} from '@automattic/wpcom-checkout';
import styled from '@emotion/styled';
import { Icon, chevronUp } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { Fragment, useId, useState } from 'react';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import { useSubmitButtonSlot } from '../lib/submit-button-slot';
import { PriceLoadingIndicator } from './wp-checkout-order-summary';

const Wrapper = styled.div`
	position: fixed;
	inset-block-end: 0;
	inset-inline-start: 0;
	inset-inline-end: 0;
	z-index: 100;
	background: var( --color-surface );
	border-block-start: 1px solid var( --color-border-subtle );
	padding: 16px;
	display: flex;
	flex-direction: column;
`;

const Panel = styled.div< { isOpen: boolean } >`
	display: grid;
	grid-template-rows: ${ ( props ) => ( props.isOpen ? '1fr' : '0fr' ) };
	inline-size: 100%;
	transition: grid-template-rows 300ms cubic-bezier( 0.16, 1, 0.3, 1 );

	@media ( prefers-reduced-motion: reduce ) {
		transition-duration: 1ms;
	}
`;

const PanelInner = styled.div< { isOpen: boolean } >`
	min-block-size: 0;
	overflow: hidden;
	opacity: ${ ( props ) => ( props.isOpen ? 1 : 0 ) };
	transform: translateY( ${ ( props ) => ( props.isOpen ? '0' : '6px' ) } );
	transition:
		opacity 220ms ease,
		transform 300ms cubic-bezier( 0.16, 1, 0.3, 1 );

	@media ( prefers-reduced-motion: reduce ) {
		transition-duration: 1ms;
	}
`;

const ToggleRow = styled.button`
	appearance: none;
	background: none;
	border: none;
	padding: 0;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 8px;
	inline-size: 100%;
	color: var( --studio-gray-100 );
	font-size: 20px;
	font-weight: 500;
	line-height: 26px;
	letter-spacing: 0.38px;
	text-align: start;

	s {
		font-weight: 400;
		color: var( --studio-gray-50 );
	}

	&:focus-visible {
		outline: 2px solid var( --color-primary );
		outline-offset: 2px;
		border-radius: 4px;
	}
`;

const ChevronWrapper = styled.span< { isOpen: boolean } >`
	flex-shrink: 0;
	display: inline-flex;
	color: var( --studio-gray-100 );
	transition: transform 350ms cubic-bezier( 0.34, 1.56, 0.64, 1 );
	transform: ${ ( props ) => ( props.isOpen ? 'rotate(180deg)' : 'rotate(0deg)' ) };

	@media ( prefers-reduced-motion: reduce ) {
		transition-duration: 1ms;
	}
`;

const SubmitRow = styled.div`
	inline-size: 100%;
	margin-block-start: 16px;

	.checkout-steps__submit-button-wrapper {
		padding: 0;
		inline-size: 100%;
	}

	/* SubmitButtonHeader is display:none until a '.checkout__step-wrapper--last-step'
	   ancestor reveals it; the portal moves it out of that ancestor, so reveal it
	   here. */
	.checkout-steps__submit-button-header {
		display: block;
		margin-block: 12px 0;
	}

	/* Match the guarantee (14px) to the terms line (13px). Scoped here, not on the
	   shared wrapper, which control also uses. */
	.checkout-steps__submit-footer-wrapper {
		font-size: 13px;
		text-align: center;
	}

	.checkout-steps__submit-footer-wrapper p {
		font-size: 13px;
	}

	.checkout-steps__submit-button-wrapper > button,
	.checkout-submit-button,
	.checkout-submit-button button {
		inline-size: 100%;
	}
`;

const Summary = styled.div`
	display: flex;
	flex-direction: column;
	gap: 16px;
	max-block-size: 70vh;
	overflow-y: auto;
	margin-block-end: 16px;
`;

const SummaryTitle = styled.p`
	margin: 0;
	font-size: 20px;
	font-weight: 500;
	line-height: 26px;
	letter-spacing: 0.38px;
	color: var( --studio-gray-100 );
`;

const ProductRow = styled.div`
	display: flex;
	gap: 8px;
	align-items: flex-start;
	font-size: 16px;
	line-height: 24px;

	s {
		font-weight: 400;
		color: var( --studio-gray-50 );
	}

	> :last-child span {
		font-weight: 500;
		color: var( --studio-gray-100 );
	}
`;

const ProductInfo = styled.div`
	flex: 1;
	min-inline-size: 0;
	display: flex;
	flex-direction: column;
`;

const ProductName = styled.div`
	font-weight: 500;
	color: var( --studio-gray-100 );
`;

const ProductSublabel = styled.div`
	font-size: 12px;
	line-height: 20px;
	color: var( --studio-gray-50 );
`;

const ProductDiscount = styled.div`
	font-size: 12px;
	line-height: 20px;
	color: var( --studio-green-50 );
`;

const Divider = styled.div`
	block-size: 1px;
	inline-size: 100%;
	background: var( --studio-gray-5 );
`;

const TotalPriceGroup = styled.span`
	display: inline-flex;
	align-items: center;
	gap: 8px;
`;

/**
 * A cart-level row (coupon, tax, credits) below the products. Built from the same
 * pieces as the product rows so its type treatment can't drift from them. Omit
 * `formattedAmount` for a label-only row like "Tax: to be calculated".
 */
function SummaryLineItemRow( {
	label,
	formattedAmount,
	isCartUpdating,
}: {
	label: string;
	formattedAmount?: string;
	isCartUpdating: boolean;
} ) {
	return (
		<>
			<Divider />
			<ProductRow>
				<ProductInfo>
					<ProductName>{ label }</ProductName>
				</ProductInfo>
				{ formattedAmount !== undefined &&
					( isCartUpdating ? (
						<PriceLoadingIndicator width="50px" />
					) : (
						<LineItemPrice actualAmount={ formattedAmount } />
					) ) }
			</ProductRow>
		</>
	);
}

function StickyOrderSummary( {
	responseCart,
	isCartUpdating,
}: {
	responseCart: ResponseCart;
	isCartUpdating: boolean;
} ) {
	const translate = useTranslate();
	// Coupons/tax/credits, so the panel reconciles with the tax-inclusive,
	// discount-net total in the bar. Same helpers and conditions control uses.
	const couponLineItem = getCouponLineItemFromCart( responseCart );
	const taxLineItems = getTaxBreakdownLineItemsFromCart( responseCart );
	const creditsLineItem = getCreditsLineItemFromCart( responseCart );

	return (
		<Summary>
			<SummaryTitle>{ translate( 'Order summary' ) }</SummaryTitle>
			{ responseCart.products.map( ( product, index ) => {
				const isDiscounted = product.item_subtotal_integer < product.item_original_subtotal_integer;
				const actualAmount = formatCurrency( product.item_subtotal_integer, product.currency, {
					isSmallestUnit: true,
					stripZeros: true,
				} );
				const crossedOutAmount = isDiscounted
					? formatCurrency( product.item_original_subtotal_integer, product.currency, {
							isSmallestUnit: true,
							stripZeros: true,
					  } )
					: undefined;
				const costOverrides = filterCostOverridesForLineItem( product, translate );
				return (
					<Fragment key={ product.uuid }>
						{ index > 0 && <Divider /> }
						<ProductRow>
							<ProductInfo>
								<ProductName>{ getLabel( product ) }</ProductName>
								<ProductSublabel>
									<LineItemBillingInterval product={ product } />
								</ProductSublabel>
								{ costOverrides.map( ( costOverride, overrideIndex ) => (
									<ProductDiscount key={ overrideIndex }>
										{ costOverride.humanReadableReason }
									</ProductDiscount>
								) ) }
							</ProductInfo>
							{ isCartUpdating ? (
								<PriceLoadingIndicator width="60px" />
							) : (
								<LineItemPrice
									actualAmount={ actualAmount }
									crossedOutAmount={ crossedOutAmount }
								/>
							) }
						</ProductRow>
					</Fragment>
				);
			} ) }
			{ /* Order mirrors control: coupon, tax, credits. */ }
			{ couponLineItem && (
				<SummaryLineItemRow
					label={ couponLineItem.label }
					formattedAmount={ couponLineItem.formattedAmount }
					isCartUpdating={ isCartUpdating }
				/>
			) }
			{ taxLineItems.map( ( taxLineItem ) => (
				<SummaryLineItemRow
					key={ taxLineItem.id }
					label={ taxLineItem.label }
					formattedAmount={ taxLineItem.formattedAmount }
					isCartUpdating={ isCartUpdating }
				/>
			) ) }
			{ isBillingInfoEmpty( responseCart ) && (
				<SummaryLineItemRow
					label={ String( translate( 'Tax: to be calculated', { textOnly: true } ) ) }
					isCartUpdating={ isCartUpdating }
				/>
			) }
			{ creditsLineItem && responseCart.sub_total_integer > 0 && (
				<SummaryLineItemRow
					label={ creditsLineItem.label }
					formattedAmount={ creditsLineItem.formattedAmount }
					isCartUpdating={ isCartUpdating }
				/>
			) }
		</Summary>
	);
}

export function MobileCheckoutStickySummary() {
	const translate = useTranslate();
	const cartKey = useCartKey();
	const { responseCart } = useShoppingCart( cartKey );
	const totalLineItem = getTotalLineItemFromCart( responseCart );
	const originalTotalInteger = responseCart.products.reduce(
		( total, product ) => total + product.item_original_subtotal_integer,
		0
	);
	const crossedOutTotal =
		originalTotalInteger > responseCart.total_cost_integer
			? formatCurrency( originalTotalInteger, responseCart.currency, {
					isSmallestUnit: true,
					stripZeros: true,
			  } )
			: undefined;
	const { setSlotEl } = useSubmitButtonSlot();
	const [ isOpen, setIsOpen ] = useState( false );
	const panelId = useId();
	const { formStatus } = useFormStatus();
	// The bar is fixed on screen for the whole checkout, so a stale price here is
	// far more visible than in the sidebar. Mirror the summary's own handling.
	const isCartUpdating = FormStatus.VALIDATING === formStatus;

	return (
		<Wrapper>
			<Panel isOpen={ isOpen } id={ panelId } aria-hidden={ ! isOpen }>
				<PanelInner isOpen={ isOpen }>
					<StickyOrderSummary responseCart={ responseCart } isCartUpdating={ isCartUpdating } />
				</PanelInner>
			</Panel>

			<ToggleRow
				type="button"
				onClick={ () => setIsOpen( ( value ) => ! value ) }
				aria-expanded={ isOpen }
				aria-controls={ panelId }
				aria-label={
					translate( 'Total: %(amount)s', {
						args: { amount: totalLineItem.formattedAmount },
						comment: 'Total price shown in the mobile checkout sticky bar',
					} ) as string
				}
			>
				<span>{ translate( 'Total:' ) }</span>
				<TotalPriceGroup>
					{ isCartUpdating ? (
						<PriceLoadingIndicator width="80px" height="22px" />
					) : (
						<LineItemPrice
							actualAmount={ totalLineItem.formattedAmount }
							crossedOutAmount={ crossedOutTotal }
						/>
					) }
					<ChevronWrapper isOpen={ isOpen } aria-hidden="true">
						<Icon icon={ chevronUp } size={ 24 } />
					</ChevronWrapper>
				</TotalPriceGroup>
			</ToggleRow>

			{ /* The submit button portals in here with control's terms line and
			     guarantee, so the bar renders no terms copy of its own. */ }
			<SubmitRow>
				<div ref={ setSlotEl } style={ { inlineSize: '100%' } } />
			</SubmitRow>
		</Wrapper>
	);
}
