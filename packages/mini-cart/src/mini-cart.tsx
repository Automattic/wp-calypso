import { CheckoutProvider, Button } from '@automattic/composite-checkout';
import { useShoppingCart } from '@automattic/shopping-cart';
import { isBillingInfoEmpty } from '@automattic/wpcom-checkout';
import styled from '@emotion/styled';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { formatCurrency } from 'i18n-calypso';
import { MiniCartLineItems } from './mini-cart-line-items';
import type { PaymentMethod } from '@automattic/composite-checkout';
import type { ResponseCart } from '@automattic/shopping-cart';

const MiniCartWrapper = styled.div`
	box-sizing: border-box;
	padding: 16px;
	max-width: 480px;
	text-align: left;
	font-size: 1rem;
`;

const MiniCartHeader = styled.div`
	text-align: left;
	display: grid;
	grid-template-columns: 2fr 1fr;
`;

const MiniCartTitle = styled.h2`
	font-size: 1.5rem;
	line-height: 1em;
	font-family: 'Recoleta';
	margin-bottom: 5px;
	grid-column: 1/2;
	grid-row: 1;
`;

const MiniCartCloseButton = styled.button`
	color: var( --color-text-subtle );
	cursor: pointer;
	grid-column: 2/3;
	grid-row: 1;
	justify-self: end;
	font-size: 1.4em;
	&:hover,
	&:focus {
		color: var( --color-neutral-70 );
	}
`;

const MiniCartSiteTitle = styled.span`
	color: var( --color-neutral-50 );
	font-size: 0.875rem;
	grid-column: 1/3;
	grid-row: 2;
`;

const MiniCartFooter = styled.div`
	margin-top: 12px;
`;

const MiniCartTotalWrapper = styled.div`
	font-weight: 600;
	display: flex;
	flex-wrap: wrap;
	justify-content: space-between;
	margin-bottom: 4px;
`;

/*
 * Utility class to hide content visually while keeping it screen reader-accessible.
 * Source: https://www.scottohara.me/blog/2017/04/14/inclusively-hidden.html
 */
const HiddenText = styled.span`
	clip: rect( 0 0 0 0 );
	clip-path: inset( 100% );
	height: 1px;
	overflow: hidden;
	position: absolute;
	white-space: nowrap;
	width: 1px;
`;

const TaxCalculationLineItemWrapper = styled.div`
	font-size: 12px;
	text-wrap: pretty;
	line-height: 1em;
`;

function TaxNotCalculatedLineItem() {
	const { __ } = useI18n();
	return (
		<TaxCalculationLineItemWrapper>{ __( 'Tax: to be calculated' ) }</TaxCalculationLineItemWrapper>
	);
}

function TaxAddedLineItem() {
	const { __ } = useI18n();
	return (
		<TaxCalculationLineItemWrapper>
			{ __( 'Includes applicable taxes' ) }
		</TaxCalculationLineItemWrapper>
	);
}

function MiniCartTotal( { responseCart }: { responseCart: ResponseCart } ) {
	const { _x } = useI18n();
	return (
		<MiniCartTotalWrapper className="mini-cart__total">
			<span>{ _x( 'Total', 'The label of the total line item in checkout' ) }</span>
			<span>
				{ formatCurrency( responseCart.total_cost_integer, responseCart.currency, {
					isSmallestUnit: true,
					stripZeros: true,
				} ) }
			</span>
		</MiniCartTotalWrapper>
	);
}

function CloseIcon() {
	return <span>✕</span>;
}

// The CheckoutProvider normally is used to provide a payment flow, but in this
// case we just want its UI features so we set its payment methods to an empty
// array. This could be improved in the future by using just the required
// features of the provider.
const emptyPaymentMethods: PaymentMethod[] = [];
const emptyPaymentProcessors = {};

export function MiniCart( {
	selectedSiteSlug,
	cartKey,
	goToCheckout,
	closeCart,
	onRemoveProduct,
	onRemoveCoupon,
	checkoutLabel,
	emptyCart,
}: {
	selectedSiteSlug: string;
	cartKey: number | undefined;
	goToCheckout: ( siteSlug: string ) => void;
	closeCart: () => void;
	onRemoveProduct?: ( uuid: string ) => void;
	onRemoveCoupon?: () => void;
	checkoutLabel?: string;
	emptyCart?: React.ReactNode;
} ) {
	const { responseCart, removeCoupon, removeProductFromCart, isLoading, isPendingUpdate } =
		useShoppingCart( cartKey ? cartKey : undefined );
	const { __ } = useI18n();

	const shouldRenderEmptyCart = emptyCart && responseCart.products.length <= 0;
	const isDisabled = isLoading || isPendingUpdate;

	const handleRemoveCoupon = () => {
		onRemoveCoupon?.();
		return removeCoupon();
	};

	const handleRemoveProduct = ( uuid: string ) => {
		onRemoveProduct?.( uuid );
		return removeProductFromCart( uuid );
	};

	if ( ! cartKey ) {
		return null;
	}

	return (
		<CheckoutProvider
			paymentMethods={ emptyPaymentMethods }
			paymentProcessors={ emptyPaymentProcessors }
		>
			<MiniCartWrapper className="mini-cart">
				<MiniCartHeader className="mini-cart__header">
					<MiniCartTitle className="mini-cart__title">{ __( 'Cart' ) }</MiniCartTitle>
					<MiniCartCloseButton className="mini-cart__close-button" onClick={ closeCart }>
						<CloseIcon />
						<HiddenText>{ __( 'Close cart' ) }</HiddenText>
					</MiniCartCloseButton>
					<MiniCartSiteTitle className="mini-cart__site-title">
						{ sprintf(
							/* translators: %s is the site slug */
							__( 'For %s' ),
							selectedSiteSlug
						) }
					</MiniCartSiteTitle>
				</MiniCartHeader>
				<MiniCartLineItems
					removeCoupon={ handleRemoveCoupon }
					removeProductFromCart={ handleRemoveProduct }
					responseCart={ responseCart }
				/>
				{ shouldRenderEmptyCart && emptyCart }
				{ ! shouldRenderEmptyCart && <MiniCartTotal responseCart={ responseCart } /> }
				{ ! shouldRenderEmptyCart && isBillingInfoEmpty( responseCart ) && (
					<TaxNotCalculatedLineItem />
				) }
				{ ! shouldRenderEmptyCart && ! isBillingInfoEmpty( responseCart ) && <TaxAddedLineItem /> }
				<MiniCartFooter className="mini-cart__footer">
					{ ! shouldRenderEmptyCart && (
						<Button
							className="mini-cart__checkout"
							buttonType="primary"
							fullWidth
							disabled={ isDisabled }
							isBusy={ isDisabled }
							onClick={ () => goToCheckout( selectedSiteSlug ) }
						>
							{ checkoutLabel || __( 'Checkout' ) }
						</Button>
					) }
				</MiniCartFooter>
			</MiniCartWrapper>
		</CheckoutProvider>
	);
}
