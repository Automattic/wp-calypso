import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import LoadingLine from './loading-content';
import useCartForDIFM, { CartItem } from './use-cart-for-difm';

const CartContainer = styled.div`
	position: relative;
	@media ( max-width: 600px ) {
		z-index: 177;
		margin-bottom: 61px;
		position: fixed;
		background: white;
		width: 100%;
		bottom: 0;
		left: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	margin-bottom: 48px;
`;

const LoadingContainer = styled.div`
	position: relative;
	@media ( max-width: 600px ) {
		z-index: 177;
		margin-bottom: 61px;
		position: fixed;
		background: white;
		width: 100%;
		bottom: 0;
		left: 0;
		border-top: 1px solid var( --studio-gray-5 );
		padding: 0 0 2px 0;
	}
	margin-bottom: 48px;
`;

const Cart = styled.div`
	position: initial;

	@media ( max-width: 600px ) {
		padding: 5px 15px 5px;
		width: 100%;
		border-top: 1px solid var( --studio-gray-5 );
	}
	.page-picker__disclaimer {
		color: var( --studio-gray-50 );
		font-size: 12px;

		@media ( max-width: 600px ) {
			padding: 5px 0;
		}
	}
`;
const DummyLineItemContainer = styled.div`
	display: flex;
	flex-wrap: wrap;
	justify-content: space-between;
	font-weight: 400;
	color: var( --studio-gray-80 );
	font-size: 14px;
	padding: 16px 0;
	border-bottom: 1px solid var( --studio-gray-5 );
	position: relative;
	.page-picker__title {
		flex: 1;
		word-break: break-word;
		@media ( max-width: 600px ) {
			display: flex;
			font-size: 0.9em;
		}
	}
	.page-picker__price {
		font-weight: 500;
	}
	.page-picker__sub-label {
		color: var( --studio-gray-50 );
		font-size: 12px;
		width: 100%;
		display: flex;
		flex-direction: row;
		align-content: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 2px 10px;
	}

	span {
		position: relative;
	}

	@media ( max-width: 600px ) {
		padding: 10px 0px 10px 0px;
		border-bottom: 1px solid var( --studio-gray-10 );
		.page-picker__sub-label {
		}
	}
`;

const LineItemsWrapper = styled.div`
	box-sizing: border-box;
	margin-top: 20px;
	margin-bottom: 5px;
	padding: 0;
	overflow-y: auto;
	max-height: 75vh;
	width: 100%;
	max-width: 365px;
	border-bottom: 1px solid var( --studio-gray-5 );
	@media ( max-width: 600px ) {
		margin: 0 0px;
		border: none;
		max-width: 100%;
	}
`;

const Total = styled.div`
	font-weight: 500;
	display: flex;
	flex-wrap: wrap;
	justify-content: space-between;
	padding: 30px 0;
	div {
		display: flex;
		align-items: center;
		&.page-picker__value {
			font-family: Recoleta;
			font-size: 32px;
			font-weight: 400;
			@media ( max-width: 600px ) {
				font-size: 16px;
			}
		}
	}

	@media ( max-width: 600px ) {
		font-size: 16px;
		margin-top: 6px;
		padding: 5px 0px;
		border-bottom: 1px solid var( --studio-gray-5 );
	}
`;

function DummyLineItem( {
	productDisplayCost,
	productOriginalName,
	subLabel,
	nameOverride,
}: CartItem & { currencyCode: string } ) {
	return (
		<DummyLineItemContainer>
			<div className="page-picker__title">
				<div className="page-picker__product-name">{ nameOverride ?? productOriginalName }</div>
			</div>
			<div className="page-picker__price">{ productDisplayCost }</div>
			{ subLabel && <div className="page-picker__sub-label">{ subLabel }</div> }
		</DummyLineItemContainer>
	);
}

export default function ShoppingCartForDIFM( { selectedPages }: { selectedPages: string[] } ) {
	const translate = useTranslate();
	const { items, total, effectiveCurrencyCode, isFormattedCurrencyLoading } =
		useCartForDIFM( selectedPages );
	return isFormattedCurrencyLoading || effectiveCurrencyCode === null ? (
		<LoadingContainer>
			<LoadingLine key="plan-placeholder" />
			<LoadingLine key="difm-placeholder" />
			<LoadingLine key="total-placeholder" />
		</LoadingContainer>
	) : (
		<CartContainer>
			<Cart>
				<LineItemsWrapper>
					{ items.map( ( item ) => (
						<DummyLineItem
							key={ item.productSlug }
							{ ...item }
							currencyCode={ effectiveCurrencyCode }
						/>
					) ) }

					<Total>
						<div>{ translate( 'Total' ) }</div>
						<div className="page-picker__value">{ total }*</div>
					</Total>
				</LineItemsWrapper>
				<div className="page-picker__disclaimer">
					{ translate( '*Final price will be calculated at checkout.' ) }
				</div>
			</Cart>
		</CartContainer>
	);
}
