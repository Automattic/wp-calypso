/**
 * @jest-environment jsdom
 */

import { getEmptyResponseCart } from '@automattic/shopping-cart';
import { render, fireEvent, screen } from '@testing-library/react';
import page from 'page';
import { useReducer } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { ORDER_TRANSACTION_STATUS } from 'calypso/state/order-transactions/constants';
import { WeChatPaymentQRcode } from '../payment-methods/wechat/wechat-payment-qrcode';
import { createTestReduxStore } from './util';

jest.mock( 'page', () => jest.fn() );

const cart = getEmptyResponseCart();

const defaultProps = {
	orderId: 1,
	redirectUrl: 'wexin://redirect',
	cart,
	slug: 'example.com',
	showErrorNotice: jest.fn(),
	transactionReceiptId: null,
	transactionStatus: null,
	transactionError: null,
	reset: jest.fn(),
	translate: ( x ) => x,
};

describe( 'WeChatPaymentQRcode', () => {
	let TestContainer;
	beforeEach( () => {
		const store = createTestReduxStore();
		TestContainer = ( props ) => {
			const [ , forceUpdate ] = useReducer( ( x ) => x + 1, 0 );
			return (
				<ReduxProvider store={ store }>
					<WeChatPaymentQRcode { ...props } />
					<button onClick={ forceUpdate }>Refresh</button>
				</ReduxProvider>
			);
		};
	} );

	test( 'has correct components and css', () => {
		render( <TestContainer { ...defaultProps } /> );
		expect(
			screen.getByText(
				'Please scan the barcode using the WeChat Pay application to confirm your %(price)s payment.'
			)
		).toBeInTheDocument();
		expect(
			screen.getByText(
				'On mobile? To open and pay with the WeChat Pay app directly, {{a}}click here{{/a}}.'
			)
		).toBeInTheDocument();
		expect( screen.getByTestId( 'wechat-qrcode' ).dataset.redirectUrl ).toEqual(
			defaultProps.redirectUrl
		);
	} );

	test( 'transaction success triggers page change', async () => {
		const reset = jest.fn();

		render(
			<TestContainer
				{ ...defaultProps }
				transactionStatus={ ORDER_TRANSACTION_STATUS.SUCCESS }
				transactionReceiptId={ 1 }
				reset={ reset }
			/>
		);

		fireEvent.click( await screen.findByText( 'Refresh' ) );

		expect( page ).toHaveBeenCalledWith( `/checkout/thank-you/${ defaultProps.slug }/1` );
		expect( reset ).toHaveBeenCalled();
	} );

	test( 'transaction failure triggers page change', async () => {
		const reset = jest.fn();

		render(
			<TestContainer
				{ ...defaultProps }
				transactionStatus={ ORDER_TRANSACTION_STATUS.FAILURE }
				reset={ reset }
			/>
		);

		fireEvent.click( await screen.findByText( 'Refresh' ) );

		expect( page ).toHaveBeenCalledWith( `/checkout/${ defaultProps.slug }` );
		expect( reset ).toHaveBeenCalled();
	} );

	test( 'transaction unknown triggers page change', async () => {
		const reset = jest.fn();

		render(
			<TestContainer
				{ ...defaultProps }
				transactionError={ new Error( 'Example' ) }
				reset={ reset }
			/>
		);

		fireEvent.click( await screen.findByText( 'Refresh' ) );

		expect( page ).toHaveBeenCalledWith( `/checkout/${ defaultProps.slug }` );
		expect( reset ).toHaveBeenCalled();
	} );
} );
