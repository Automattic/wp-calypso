import { localizeUrl } from '@automattic/i18n-utils';
import { formatCurrency } from '@automattic/number-formatters';
import { useShoppingCart, type ResponseCart } from '@automattic/shopping-cart';
import {
	getLabel,
	getTotalLineItemFromCart,
	LineItemBillingInterval,
	LineItemPrice,
} from '@automattic/wpcom-checkout';
import styled from '@emotion/styled';
import { Icon, chevronUp } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { Fragment, useId, useState } from 'react';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import { useSubmitButtonSlot } from '../lib/submit-button-slot';

const Wrapper = styled.div`
	position: fixed;
	inset-block-end: 0;
	inset-inline-start: 0;
	inset-inline-end: 0;
	z-index: 100;
	background: var( --color-surface );
	border-block-start: 1px solid rgba( 0, 0, 0, 0.08 );
	padding: 16px;
	display: flex;
	flex-direction: column;
	gap: 16px;
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
	display: flex;
	align-items: center;

	.checkout-steps__submit-button-wrapper {
		padding: 0;
		inline-size: 100%;
	}

	.checkout-submit-button,
	.checkout-submit-button button {
		width: 100%;
	}
`;

const TosWrapper = styled.div`
	inline-size: 100%;
	font-size: 12px;
	line-height: 20px;
	color: var( --studio-gray-50 );
	text-align: center;

	a,
	button {
		color: var( --studio-gray-100 );
		text-decoration: underline;
		background: none;
		border: none;
		padding: 0;
		font: inherit;
		cursor: pointer;
	}
`;

const Summary = styled.div`
	display: flex;
	flex-direction: column;
	gap: 16px;
	max-block-size: 70vh;
	overflow-y: auto;
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

function StickyOrderSummary( { responseCart }: { responseCart: ResponseCart } ) {
	const translate = useTranslate();

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
				return (
					<Fragment key={ product.uuid }>
						{ index > 0 && <Divider /> }
						<ProductRow>
							<ProductInfo>
								<ProductName>{ getLabel( product ) }</ProductName>
								<ProductSublabel>
									<LineItemBillingInterval product={ product } />
								</ProductSublabel>
							</ProductInfo>
							<LineItemPrice actualAmount={ actualAmount } crossedOutAmount={ crossedOutAmount } />
						</ProductRow>
					</Fragment>
				);
			} ) }
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

	return (
		<Wrapper>
			<Panel isOpen={ isOpen } id={ panelId } aria-hidden={ ! isOpen }>
				<PanelInner isOpen={ isOpen }>
					<StickyOrderSummary responseCart={ responseCart } />
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
					<LineItemPrice
						actualAmount={ totalLineItem.formattedAmount }
						crossedOutAmount={ crossedOutTotal }
					/>
					<ChevronWrapper isOpen={ isOpen } aria-hidden="true">
						<Icon icon={ chevronUp } size={ 24 } />
					</ChevronWrapper>
				</TotalPriceGroup>
			</ToggleRow>

			<SubmitRow>
				<div ref={ setSlotEl } style={ { width: '100%' } } />
			</SubmitRow>

			<TosWrapper>
				{ translate( 'By continuing, you agree to our {{a}}Terms of Service{{/a}}.', {
					components: {
						a: (
							// eslint-disable-next-line jsx-a11y/anchor-has-content
							<a
								href={ localizeUrl( 'https://wordpress.com/tos/' ) }
								target="_blank"
								rel="noopener noreferrer"
							/>
						),
					},
				} ) }
			</TosWrapper>
		</Wrapper>
	);
}
