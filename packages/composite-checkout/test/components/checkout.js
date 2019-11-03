/**
 * External dependencies
 */
import React from 'react';
import { render, getAllByLabelText } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

/**
 * Internal dependencies
 */
import {
	Checkout,
	CheckoutProvider,
	useSelect,
	useDispatch,
	registerStore,
} from '../../src/public-api';

const noop = () => {};

describe( 'Checkout', () => {
	it( 'renders the line items and the total', () => {
		const mockMethod = createMockMethod();
		const { items, total } = createMockItems();
		const MyCheckout = () => (
			<CheckoutProvider
				locale="en-us"
				items={ items }
				total={ total }
				onSuccess={ noop }
				onFailure={ noop }
				successRedirectUrl="#"
				failureRedirectUrl="#"
				paymentMethods={ [ mockMethod ] }
			>
				<Checkout />
			</CheckoutProvider>
		);
		const { container } = render( <MyCheckout /> );

		// Product line items show the correct price
		getAllByLabelText( container, items[ 0 ].label ).map( element =>
			expect( element ).toHaveTextContent( items[ 0 ].amount.displayValue )
		);
		getAllByLabelText( container, items[ 1 ].label ).map( element =>
			expect( element ).toHaveTextContent( items[ 1 ].amount.displayValue )
		);

		// All elements labeled 'Total' show the expected price
		getAllByLabelText( container, total.label ).map( element =>
			expect( element ).toHaveTextContent( total.amount.displayValue )
		);
	} );

	it( 'renders the payment method LabelComponent', () => {
		const mockMethod = createMockMethod();
		const { items, total } = createMockItems();
		const MyCheckout = () => (
			<CheckoutProvider
				locale="en-us"
				items={ items }
				total={ total }
				onSuccess={ noop }
				onFailure={ noop }
				successRedirectUrl="#"
				failureRedirectUrl="#"
				paymentMethods={ [ mockMethod ] }
			>
				<Checkout />
			</CheckoutProvider>
		);
		const { getByTestId } = render( <MyCheckout /> );
		expect( getByTestId( 'mock-label' ) ).toHaveTextContent( 'Mock' );
	} );

	it( 'renders the payment method PaymentMethodComponent', () => {
		const mockMethod = createMockMethod();
		const { items, total } = createMockItems();
		const MyCheckout = () => (
			<CheckoutProvider
				locale="en-us"
				items={ items }
				total={ total }
				onSuccess={ noop }
				onFailure={ noop }
				successRedirectUrl="#"
				failureRedirectUrl="#"
				paymentMethods={ [ mockMethod ] }
			>
				<Checkout />
			</CheckoutProvider>
		);
		const { getAllByTestId } = render( <MyCheckout /> );
		const [ activeComponent, summaryComponent ] = getAllByTestId( 'mock-payment-form' );
		expect( activeComponent ).toHaveTextContent( 'Cardholder Name' );
		expect( summaryComponent ).toHaveTextContent( 'Name Summary' );
	} );

	it( 'renders the payment method BillingContactComponent', () => {
		const mockMethod = createMockMethod();
		const { items, total } = createMockItems();
		const MyCheckout = () => (
			<CheckoutProvider
				locale="en-us"
				items={ items }
				total={ total }
				onSuccess={ noop }
				onFailure={ noop }
				successRedirectUrl="#"
				failureRedirectUrl="#"
				paymentMethods={ [ mockMethod ] }
			>
				<Checkout />
			</CheckoutProvider>
		);
		const { getByTestId } = render( <MyCheckout /> );
		expect( getByTestId( 'mock-payment-details' ) ).toHaveTextContent( 'Mock Details' );
	} );

	it( 'renders the review step', () => {
		const mockMethod = createMockMethod();
		const { items, total } = createMockItems();
		const MyCheckout = () => (
			<CheckoutProvider
				locale="en-us"
				items={ items }
				total={ total }
				onSuccess={ noop }
				onFailure={ noop }
				successRedirectUrl="#"
				failureRedirectUrl="#"
				paymentMethods={ [ mockMethod ] }
			>
				<Checkout />
			</CheckoutProvider>
		);
		const { getAllByText } = render( <MyCheckout /> );
		// Each has a length of two because of the summary
		expect( getAllByText( items[ 0 ].label ) ).toHaveLength( 2 );
		expect( getAllByText( items[ 0 ].amount.displayValue ) ).toHaveLength( 2 );
		expect( getAllByText( items[ 1 ].label ) ).toHaveLength( 2 );
		expect( getAllByText( items[ 1 ].amount.displayValue ) ).toHaveLength( 2 );
	} );

	it( 'renders the payment method SubmitButtonComponent', () => {
		const mockMethod = createMockMethod();
		const { items, total } = createMockItems();
		const MyCheckout = () => (
			<CheckoutProvider
				locale="en-us"
				items={ items }
				total={ total }
				onSuccess={ noop }
				onFailure={ noop }
				successRedirectUrl="#"
				failureRedirectUrl="#"
				paymentMethods={ [ mockMethod ] }
			>
				<Checkout />
			</CheckoutProvider>
		);
		const { getByText } = render( <MyCheckout /> );
		expect( getByText( 'Pay Please' ) ).toBeTruthy();
	} );
} );

function createMockMethod() {
	const actions = {
		changeCardholderName( payload ) {
			return { type: 'CARDHOLDER_NAME_SET', payload };
		},
	};

	registerStore( 'mock', {
		reducer( state = {}, action ) {
			switch ( action.type ) {
				case 'CARDHOLDER_NAME_SET':
					return { ...state, cardholderName: action.payload };
			}
			return state;
		},
		actions,
		selectors: {
			getCardholderName( state ) {
				return state.cardholderName || '';
			},
		},
	} );

	return {
		id: 'mock',
		LabelComponent: () => <span data-testid="mock-label">Mock</span>,
		PaymentMethodComponent: () => <span data-testid="mock-payment-details">Mock Details</span>,
		BillingContactComponent: MockPaymentForm,
		SubmitButtonComponent: () => <button>Pay Please</button>,
		getAriaLabel: () => 'Mock Method',
	};
}

function MockPaymentForm( { summary } ) {
	const cardholderName = useSelect( select => select( 'mock' ).getCardholderName() );
	const { changeCardholderName } = useDispatch( 'mock' );
	return (
		<div data-testid="mock-payment-form">
			<label>
				{ summary ? 'Name Summary' : 'Cardholder Name' }
				<input name="cardholderName" value={ cardholderName } onChange={ changeCardholderName } />
			</label>
		</div>
	);
}

function createMockItems() {
	const items = [
		{
			label: 'Illudium Q-36 Explosive Space Modulator',
			id: 'space-modulator',
			type: 'widget',
			amount: { currency: 'USD', value: 5500, displayValue: '$55' },
		},
		{
			label: 'Air Jordans',
			id: 'sneakers',
			type: 'apparel',
			amount: { currency: 'USD', value: 12000, displayValue: '$120' },
		},
	];
	const total = {
		label: 'Total',
		id: 'total',
		type: 'total',
		amount: { currency: 'USD', value: 17500, displayValue: '$175' },
	};
	return { items, total };
}
