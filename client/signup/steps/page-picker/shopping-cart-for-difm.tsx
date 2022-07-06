import formatCurrency from '@automattic/format-currency';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { getSignupDependencyStore } from 'calypso/state/signup/dependency-store/selectors';
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
		padding: 10px 15px 10px;
		width: 100%;
		border-top: 1px solid #dcdcde;
	}
	.page-picker__disclaimer {
		color: #646970;
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
	color: #2c3338;
	font-size: 14px;
	padding: 16px 0;
	border-bottom: 1px solid #dcdcde;
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
	.page-picker__meta {
		color: #646970;
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
		font-size: 0.9em;
		padding: 2px 0;
		border: none;

		.page-picker__meta {
			display: none;
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
	border-bottom: 1px solid #dcdcde;
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
		&.value {
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
		border-top: 1px solid #eee;
		border-bottom: 1px solid #eee;
	}
`;

function DummyLineItem( {
	product,
	meta,
	productCount,
	nameOverride,
	currencyCode,
}: CartItem & { currencyCode: string } ) {
	if ( ! product ) {
		return null;
	}

	return (
		<DummyLineItemContainer>
			<div className="page-picker__title">{ nameOverride ?? product.product_name }</div>
			<div className="page-picker__price">
				{ productCount !== undefined
					? formatCurrency( product.cost * productCount, currencyCode, { precision: 0 } )
					: formatCurrency( product.cost, currencyCode, { precision: 0 } ) }
			</div>
			{ meta && <div className="page-picker__meta">{ meta }</div> }
		</DummyLineItemContainer>
	);
}

export default function ShoppingCartForDIFM( { selectedPages }: { selectedPages: string[] } ) {
	const translate = useTranslate();
	const { items, total, isCartLoading } = useCartForDIFM( selectedPages );
	const signupDependencies = useSelector( getSignupDependencyStore );
	const { newOrExistingSiteChoice } = signupDependencies;
	const currencyCode = useSelector( getCurrentUserCurrencyCode );

	const isInitialBasketLoaded = items.length > 0;

	return newOrExistingSiteChoice === 'existing-site' && isCartLoading && ! isInitialBasketLoaded ? (
		<LoadingContainer>
			{ items.length === 0 ? (
				<>
					<LoadingLine key="plan-placehorder" />
					<LoadingLine key="difm-placehorder" />
				</>
			) : (
				items.map( ( lineItem ) => <LoadingLine key={ lineItem.product.product_slug } /> )
			) }
			<LoadingLine key="total-placehorder" />
		</LoadingContainer>
	) : (
		<CartContainer>
			<Cart>
				<LineItemsWrapper>
					{ items.map( ( item ) => (
						<DummyLineItem
							key={ item.product.product_slug }
							{ ...item }
							currencyCode={ currencyCode ?? 'USD' }
						/>
					) ) }

					<Total>
						<div>{ translate( 'Total' ) }</div>
						<div className="page-picker__value">{ total }*</div>
					</Total>
				</LineItemsWrapper>
				<div className="page-picker__disclaimer">*Final price will be calculated at checkout.</div>
			</Cart>
		</CartContainer>
	);
}
