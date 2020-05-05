/**
 * External dependencies
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

/**
 * Internal dependencies
 */
import {
	CheckoutProvider,
	useSelect,
	useDispatch,
	useRegisterStore,
	useFormStatus,
} from '../src/public-api';

const noop = () => {};

const CustomForm = () => {
	const { formStatus, setFormComplete, setFormLoading, setFormSubmitting } = useFormStatus();
	if ( formStatus === 'loading' ) {
		return <div>Loading</div>;
	}
	if ( formStatus === 'submitting' ) {
		return <div>Submitting</div>;
	}
	if ( formStatus === 'complete' ) {
		return <div>Form Complete</div>;
	}
	return (
		<div>
			<input type="text" />
			<button disabled={ formStatus !== 'ready' } onClick={ setFormLoading }>
				Load
			</button>
			<button disabled={ formStatus !== 'ready' } onClick={ setFormSubmitting }>
				Submit
			</button>
			<button disabled={ formStatus !== 'ready' } onClick={ setFormComplete }>
				Complete
			</button>
		</div>
	);
};

describe( 'CheckoutProvider', () => {
	let MyCheckout;
	const mockMethod = createMockMethod();
	const { items, total } = createMockItems();

	beforeEach( () => {
		MyCheckout = ( { onPaymentComplete, isLoading } ) => (
			<CheckoutProvider
				locale="en-us"
				items={ items }
				total={ total }
				isLoading={ isLoading || null }
				onPaymentComplete={ onPaymentComplete || noop }
				showErrorMessage={ noop }
				showInfoMessage={ noop }
				showSuccessMessage={ noop }
				paymentMethods={ [ mockMethod ] }
			>
				<CustomForm />
			</CheckoutProvider>
		);
	} );

	it( 'sets form status to loading when isLoading is true', () => {
		const { getByText } = render( <MyCheckout isLoading={ true } /> );
		expect( getByText( 'Loading' ) ).toBeInTheDocument();
	} );

	it( 'sets form status to ready when isLoading is false', () => {
		const { getByText } = render( <MyCheckout isLoading={ false } /> );
		expect( getByText( 'Submit' ) ).not.toBeDisabled();
	} );

	it( 'sets form status to ready when isLoading is absent', () => {
		const { getByText } = render( <MyCheckout /> );
		expect( getByText( 'Submit' ) ).not.toBeDisabled();
	} );

	it( 'sets form status to submitting when setFormSubmitting is called', () => {
		const { getByText, queryByText } = render( <MyCheckout /> );
		const button = getByText( 'Submit' );
		expect( queryByText( 'Submitting' ) ).not.toBeInTheDocument();
		fireEvent.click( button );
		expect( getByText( 'Submitting' ) ).toBeInTheDocument();
	} );

	it( 'sets form status to complete when setFormComplete is called', () => {
		const { getByText, queryByText } = render( <MyCheckout /> );
		const button = getByText( 'Complete' );
		expect( queryByText( 'Form Complete' ) ).not.toBeInTheDocument();
		fireEvent.click( button );
		expect( getByText( 'Form Complete' ) ).toBeInTheDocument();
	} );

	it( 'sets form status to loading when setFormLoading is called', () => {
		const { getByText, queryByText } = render( <MyCheckout /> );
		const button = getByText( 'Load' );
		expect( queryByText( 'Loading' ) ).not.toBeInTheDocument();
		fireEvent.click( button );
		expect( getByText( 'Loading' ) ).toBeInTheDocument();
	} );

	it( 'does not call onPaymentComplete when form status is not complete', () => {
		const onPaymentComplete = jest.fn();
		const { getByText } = render( <MyCheckout onPaymentComplete={ onPaymentComplete } /> );
		expect( getByText( 'Submit' ) ).not.toBeDisabled();
		expect( onPaymentComplete ).not.toBeCalled();
	} );

	it( 'calls onPaymentComplete when form status is complete', () => {
		const onPaymentComplete = jest.fn();
		const { getByText } = render( <MyCheckout onPaymentComplete={ onPaymentComplete } /> );
		const button = getByText( 'Complete' );
		fireEvent.click( button );
		expect( getByText( 'Form Complete' ) ).toBeInTheDocument();
		expect( onPaymentComplete ).toBeCalled();
	} );
} );

function createMockMethod() {
	return {
		id: 'mock',
		label: <span data-testid="mock-label">Mock Label</span>,
		activeContent: <MockPaymentForm />,
		submitButton: <button>Pay Please</button>,
		inactiveContent: 'Mock Method',
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
	const cardholderName = useSelect( ( select ) => select( 'mock' ).getCardholderName() );
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
