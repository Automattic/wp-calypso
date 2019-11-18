// This is required to fix the "regeneratorRuntime is not defined" error
require( '@babel/polyfill' );

/**
 * External dependencies
 */
import React from 'react';
import { render, getAllByLabelText, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

/**
 * Internal dependencies
 */
import {
	Checkout,
	CheckoutProvider,
	useSelect,
	useDispatch,
	createRegistry,
	useRegisterStore,
} from '../../src/public-api';

const noop = () => {};

describe( 'Checkout', () => {
	describe( 'using the default registry', function() {
		let MyCheckout;
		const mockMethod = createMockMethod();
		const { items, total } = createMockItems();

		beforeEach( () => {
			MyCheckout = () => (
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
		} );

		it( 'renders the line items and the total', () => {
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
			const { getAllByText } = render( <MyCheckout /> );
			expect( getAllByText( 'Mock Label' )[ 0 ] ).toBeInTheDocument();
		} );

		it( 'renders the payment method PaymentMethodComponent', () => {
			const { getByTestId } = render( <MyCheckout /> );
			const activeComponent = getByTestId( 'mock-payment-form' );
			expect( activeComponent ).toHaveTextContent( 'Cardholder Name' );
		} );

		it( 'renders the review step', () => {
			const { getAllByText } = render( <MyCheckout /> );
			expect( getAllByText( items[ 0 ].label ) ).toHaveLength( 2 );
			expect( getAllByText( items[ 0 ].amount.displayValue ) ).toHaveLength( 1 );
			expect( getAllByText( items[ 1 ].label ) ).toHaveLength( 2 );
			expect( getAllByText( items[ 1 ].amount.displayValue ) ).toHaveLength( 1 );
		} );

		it( 'renders the payment method SubmitButtonComponent', () => {
			const { getByText } = render( <MyCheckout /> );
			expect( getByText( 'Pay Please' ) ).toBeTruthy();
		} );
	} );

	describe( 'using a custom registry', function() {
		let MyCheckout;
		const mockMethod = createMockMethod();
		const { items, total } = createMockItems();

		beforeEach( () => {
			const registry = createRegistry();
			MyCheckout = ( { ContactSlot, UpSell, OrderSummary, ReviewContent } ) => (
				<CheckoutProvider
					locale="en-us"
					items={ items }
					total={ total }
					onSuccess={ noop }
					onFailure={ noop }
					successRedirectUrl="#"
					failureRedirectUrl="#"
					paymentMethods={ [ mockMethod ] }
					registry={ registry }
				>
					<Checkout
						ContactSlot={ ContactSlot }
						UpSell={ UpSell }
						OrderSummary={ OrderSummary }
						ReviewContent={ ReviewContent }
					/>
				</CheckoutProvider>
			);
		} );

		it( 'renders the line items and the total', () => {
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
			const { getAllByText } = render( <MyCheckout /> );
			expect( getAllByText( 'Mock Label' )[ 0 ] ).toBeInTheDocument();
		} );

		it( 'renders the payment method PaymentMethodComponent', () => {
			const { getByTestId } = render( <MyCheckout /> );
			const activeComponent = getByTestId( 'mock-payment-form' );
			expect( activeComponent ).toHaveTextContent( 'Cardholder Name' );
		} );

		it( 'renders the review step', () => {
			const { getAllByText } = render( <MyCheckout /> );
			expect( getAllByText( items[ 0 ].label ) ).toHaveLength( 2 );
			expect( getAllByText( items[ 0 ].amount.displayValue ) ).toHaveLength( 1 );
			expect( getAllByText( items[ 1 ].label ) ).toHaveLength( 2 );
			expect( getAllByText( items[ 1 ].amount.displayValue ) ).toHaveLength( 1 );
		} );

		it( 'renders the payment method SubmitButtonComponent', () => {
			const { getByText } = render( <MyCheckout /> );
			expect( getByText( 'Pay Please' ) ).toBeTruthy();
		} );

		it( 'renders the ReviewContent if provided', () => {
			const { getByText } = render(
				<MyCheckout ReviewContent={ () => <div>Some Review Text</div> } />
			);
			expect( getByText( 'Some Review Text' ) ).toBeTruthy();
		} );

		it( 'renders the OrderSummary if provided', () => {
			const { getByText } = render(
				<MyCheckout OrderSummary={ () => <div>Some OrderSummary Text</div> } />
			);
			expect( getByText( 'Some OrderSummary Text' ) ).toBeTruthy();
		} );

		it( 'renders the UpSell if provided', () => {
			const { getByText } = render( <MyCheckout UpSell={ () => <div>Some Upsell Text</div> } /> );
			expect( getByText( 'Some Upsell Text' ) ).toBeTruthy();
		} );

		it( 'renders the ContactSlot if provided', () => {
			const { getByText } = render(
				<MyCheckout ContactSlot={ ( { summary } ) => summary || <div>Some Contact Form</div> } />
			);
			expect( getByText( 'Some Contact Form' ) ).toBeTruthy();
		} );
	} );

	describe( 'before clicking a button', function() {
		let container;

		beforeEach( () => {
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
			const renderResult = render( <MyCheckout /> );
			container = renderResult.container;
		} );

		it( 'makes the payment method step active', () => {
			const activeSteps = container.querySelectorAll( '.checkout-step--is-active' );
			expect( activeSteps ).toHaveLength( 1 );
			expect( activeSteps[ 0 ] ).toHaveTextContent( 'Pick a payment method' );
		} );

		it( 'makes the payment method step visible', () => {
			const firstStep = container.querySelector( '.checkout__payment-methods-step' );
			const firstStepContent = firstStep.querySelector( '.checkout-step__content' );
			expect( firstStepContent ).toHaveStyle( 'display: block' );
		} );

		it( 'makes the review step invisible', () => {
			const reviewStep = container.querySelector( '.checkout__review-order-step' );
			expect( reviewStep ).toHaveTextContent( 'Review your order' );
			const reviewStepContent = reviewStep.querySelector( '.checkout-step__content' );
			expect( reviewStepContent ).toHaveStyle( 'display: none' );
		} );
	} );

	describe( 'when clicking continue from the payment method step', function() {
		let container;

		beforeEach( () => {
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
			const renderResult = render( <MyCheckout /> );
			container = renderResult.container;
			const firstStepContinue = renderResult.getAllByText( 'Continue' )[ 0 ];
			fireEvent.click( firstStepContinue );
		} );

		it( 'makes the first step invisible', () => {
			const firstStep = container.querySelector( '.checkout__payment-methods-step' );
			const firstStepContent = firstStep.querySelector( '.checkout-step__content' );
			expect( firstStepContent ).toHaveStyle( 'display: none' );
		} );

		it( 'makes the review step visible', () => {
			const reviewStep = container.querySelector( '.checkout__review-order-step' );
			const reviewStepContent = reviewStep.querySelector( '.checkout-step__content' );
			expect( reviewStepContent ).toHaveStyle( 'display: block' );
		} );
	} );

	describe( 'with a ContactSlot', function() {
		describe( 'before clicking a button', function() {
			let container;
			const ContactForm = ( { summary } ) => summary || <div>Contact Form Here</div>;

			beforeEach( () => {
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
						<Checkout ContactSlot={ ContactForm } />
					</CheckoutProvider>
				);
				const renderResult = render( <MyCheckout /> );
				container = renderResult.container;
			} );

			it( 'makes the first step visible', () => {
				const firstStep = container.querySelector( '.checkout__payment-methods-step' );
				const firstStepContent = firstStep.querySelector( '.checkout-step__content' );
				expect( firstStepContent ).toHaveStyle( 'display: block' );
			} );

			it( 'makes the contact step invisible', () => {
				const contactStep = container.querySelector( '.checkout__billing-details-step' );
				const contactStepContent = contactStep.querySelector( '.checkout-step__content' );
				expect( contactStepContent ).toHaveStyle( 'display: none' );
			} );

			it( 'makes the review step invisible', () => {
				const reviewStep = container.querySelector( '.checkout__review-order-step' );
				const reviewStepContent = reviewStep.querySelector( '.checkout-step__content' );
				expect( reviewStepContent ).toHaveStyle( 'display: none' );
			} );
		} );

		describe( 'when clicking continue from the payment method step', function() {
			let renderResult;
			const ContactForm = ( { summary } ) => summary || <div>Contact Form Here</div>;

			beforeEach( () => {
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
						<Checkout ContactSlot={ ContactForm } />
					</CheckoutProvider>
				);
				renderResult = render( <MyCheckout /> );
				const firstStepContinue = renderResult.getAllByText( 'Continue' )[ 0 ];
				fireEvent.click( firstStepContinue );
			} );

			it( 'makes the first step invisible', () => {
				const firstStep = renderResult.container.querySelector( '.checkout__payment-methods-step' );
				const firstStepContent = firstStep.querySelector( '.checkout-step__content' );
				expect( firstStepContent ).toHaveStyle( 'display: none' );
			} );

			it( 'makes the contact step visible', () => {
				const contactStep = renderResult.container.querySelector(
					'.checkout__billing-details-step'
				);
				const contactStepContent = contactStep.querySelector( '.checkout-step__content' );
				expect( contactStepContent ).toHaveStyle( 'display: block' );
			} );

			it( 'displays the contact form', () => {
				expect( renderResult.getByText( 'Contact Form Here' ) ).toBeTruthy();
			} );

			it( 'makes the review step invisible', () => {
				const reviewStep = renderResult.container.querySelector( '.checkout__review-order-step' );
				const reviewStepContent = reviewStep.querySelector( '.checkout-step__content' );
				expect( reviewStepContent ).toHaveStyle( 'display: none' );
			} );
		} );
	} );
} );

function createMockMethod() {
	return {
		id: 'mock',
		LabelComponent: () => <span data-testid="mock-label">Mock Label</span>,
		PaymentMethodComponent: MockPaymentForm,
		SubmitButtonComponent: () => <button>Pay Please</button>,
		SummaryComponent: () => 'Mock Method',
		getAriaLabel: () => 'Mock Method',
	};
}

function MockPaymentForm( { summary } ) {
	useRegisterStore( 'mock', {
		reducer( state = {}, action ) {
			switch ( action.type ) {
				case 'CARDHOLDER_NAME_SET':
					return { ...state, cardholderName: action.payload };
			}
			return state;
		},
		actions: {
			changeCardholderName( payload ) {
				return { type: 'CARDHOLDER_NAME_SET', payload };
			},
		},
		selectors: {
			getCardholderName( state ) {
				return state.cardholderName || '';
			},
		},
	} );
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
