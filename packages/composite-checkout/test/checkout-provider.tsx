/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import {
	CheckoutProvider,
	FormStatus,
	PaymentMethod,
	TransactionStatus,
	useFormStatus,
	useTransactionStatus,
} from '../src/public-api';

const CustomFormWithTransactionStatus = () => {
	const { formStatus, setFormLoading } = useFormStatus();
	const {
		transactionStatus,
		previousTransactionStatus,
		setTransactionRedirecting,
		setTransactionComplete,
		setTransactionError,
		setTransactionPending,
	} = useTransactionStatus();
	if ( formStatus === FormStatus.LOADING ) {
		return <div>Loading</div>;
	}
	if ( transactionStatus === TransactionStatus.REDIRECTING ) {
		return <div>Redirecting</div>;
	}
	if (
		transactionStatus === TransactionStatus.NOT_STARTED &&
		previousTransactionStatus === TransactionStatus.ERROR &&
		formStatus === FormStatus.READY
	) {
		return <div>Showing Error</div>;
	}
	if ( transactionStatus === TransactionStatus.ERROR && formStatus !== FormStatus.READY ) {
		return <div>Error State but Form Status is '{ formStatus }'</div>;
	}
	if ( transactionStatus === TransactionStatus.COMPLETE ) {
		return <div>Form Complete</div>;
	}
	if ( formStatus === FormStatus.SUBMITTING ) {
		return <div>Submitting</div>;
	}
	return (
		<div>
			previous { previousTransactionStatus }
			<input type="text" />
			<button
				disabled={ formStatus !== FormStatus.READY }
				onClick={ () => setTransactionError( 'bad things happened' ) }
			>
				Cause Error
			</button>
			<button disabled={ formStatus !== FormStatus.READY } onClick={ setFormLoading }>
				Load
			</button>
			<button
				disabled={ formStatus !== FormStatus.READY }
				onClick={ () => setTransactionPending() }
			>
				Submit
			</button>
			<button
				disabled={ formStatus !== FormStatus.READY }
				onClick={ () => setTransactionRedirecting( 'url.here' ) }
			>
				Redirect
			</button>
			<button
				disabled={ formStatus !== FormStatus.READY }
				onClick={ () => setTransactionComplete( true ) }
			>
				Complete
			</button>
		</div>
	);
};

describe( 'CheckoutProvider', () => {
	let MyCheckout;
	const mockMethod = createMockMethod();

	beforeEach( () => {
		MyCheckout = ( { onPaymentComplete, isLoading, onPaymentError, onPaymentRedirect } ) => {
			const [ isValidating, setValidating ] = useState( false );
			return (
				<div>
					<button onClick={ () => setValidating( true ) }>Set isValidating true</button>
					<button onClick={ () => setValidating( false ) }>Set isValidating false</button>
					<CheckoutProvider
						isLoading={ isLoading || null }
						isValidating={ isValidating || null }
						onPaymentComplete={ onPaymentComplete }
						onPaymentError={ onPaymentError }
						onPaymentRedirect={ onPaymentRedirect }
						paymentMethods={ [ mockMethod ] }
						paymentProcessors={ {} }
						initiallySelectedPaymentMethodId={ mockMethod.id }
					>
						<CustomFormWithTransactionStatus />
					</CheckoutProvider>
				</div>
			);
		};
	} );

	it( 'sets form status to loading when isLoading is true', () => {
		const { getByText } = render( <MyCheckout isLoading /> );
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

	it( 'sets form status to submitting when setFormSubmitting is called', async () => {
		const user = userEvent.setup();
		render( <MyCheckout /> );
		expect( screen.queryByText( 'Submitting' ) ).not.toBeInTheDocument();
		user.click( screen.getByText( 'Submit' ) );
		expect( await screen.findByText( 'Submitting' ) ).toBeInTheDocument();
	} );

	it( 'sets form status to loading when setFormLoading is called', async () => {
		const user = userEvent.setup();
		render( <MyCheckout /> );
		expect( screen.queryByText( 'Loading' ) ).not.toBeInTheDocument();
		user.click( screen.getByText( 'Load' ) );
		expect( await screen.findByText( 'Loading' ) ).toBeInTheDocument();
	} );

	it( 'does not call onPaymentComplete when transaction status is not complete', async () => {
		const onPaymentComplete = jest.fn();
		render( <MyCheckout onPaymentComplete={ onPaymentComplete } /> );
		expect( screen.getByText( 'Submit' ) ).not.toBeDisabled();
		expect( onPaymentComplete ).not.toHaveBeenCalled();
	} );

	it( 'calls onPaymentComplete when transaction status is complete', async () => {
		const user = userEvent.setup();
		const onPaymentComplete = jest.fn();
		render( <MyCheckout onPaymentComplete={ onPaymentComplete } /> );
		user.click( screen.getByText( 'Complete' ) );
		expect( await screen.findByText( 'Form Complete' ) ).toBeInTheDocument();
		expect( onPaymentComplete ).toHaveBeenCalled();
	} );

	it( 'does not call onPaymentComplete twice when transaction status is complete even if callback changes', async () => {
		const user = userEvent.setup();
		const onPaymentComplete = jest.fn();
		const { getByText, rerender } = render(
			<MyCheckout onPaymentComplete={ () => onPaymentComplete() } />
		);
		user.click( getByText( 'Complete' ) );
		rerender( <MyCheckout onPaymentComplete={ () => onPaymentComplete() } /> );
		expect( await screen.findByText( 'Form Complete' ) ).toBeInTheDocument();
		expect( onPaymentComplete.mock.calls.length ).toBe( 1 );
	} );

	it( 'sets form status to submitting when setTransactionPending is called', async () => {
		const user = userEvent.setup();
		render( <MyCheckout /> );
		expect( screen.queryByText( 'Submitting' ) ).not.toBeInTheDocument();
		user.click( screen.getByText( 'Submit' ) );
		expect( await screen.findByText( 'Submitting' ) ).toBeInTheDocument();
	} );

	it( 'sets transaction status to complete when setTransactionComplete is called', async () => {
		const user = userEvent.setup();
		render( <MyCheckout /> );
		expect( screen.queryByText( 'Form Complete' ) ).not.toBeInTheDocument();
		user.click( screen.getByText( 'Complete' ) );
		expect( await screen.findByText( 'Form Complete' ) ).toBeInTheDocument();
	} );

	it( 'sets form status to ready when setTransactionError is called', async () => {
		const user = userEvent.setup();
		render( <MyCheckout /> );
		expect( screen.queryByText( 'Showing Error' ) ).not.toBeInTheDocument();
		user.click( screen.getByText( 'Cause Error' ) );
		expect( await screen.findByText( 'Showing Error' ) ).toBeInTheDocument();
	} );

	it( 'does not call onPaymentComplete when form loads', async () => {
		const onPaymentComplete = jest.fn();
		render( <MyCheckout onPaymentComplete={ onPaymentComplete } /> );
		expect( screen.getByText( 'Submit' ) ).not.toBeDisabled();
		expect( onPaymentComplete ).not.toHaveBeenCalled();
	} );

	it( 'does not call onPaymentRedirect when form loads', async () => {
		const onPaymentRedirect = jest.fn();
		render( <MyCheckout onPaymentRedirect={ onPaymentRedirect } /> );
		expect( screen.getByText( 'Submit' ) ).not.toBeDisabled();
		expect( onPaymentRedirect ).not.toHaveBeenCalled();
	} );

	it( 'does not call onPaymentRedirect when transaction status is complete', async () => {
		const user = userEvent.setup();
		const onPaymentRedirect = jest.fn();
		render( <MyCheckout onPaymentRedirect={ onPaymentRedirect } /> );
		user.click( screen.getByText( 'Complete' ) );
		expect( await screen.findByText( 'Form Complete' ) ).toBeInTheDocument();
		expect( onPaymentRedirect ).not.toHaveBeenCalled();
	} );

	it( 'does not call onPaymentRedirect twice when transaction status is redirecting even if callback changes', async () => {
		const user = userEvent.setup();
		const onPaymentRedirect = jest.fn();
		const { getByText, rerender } = render(
			<MyCheckout onPaymentRedirect={ () => onPaymentRedirect() } />
		);
		user.click( getByText( 'Redirect' ) );
		rerender( <MyCheckout onPaymentRedirect={ () => onPaymentRedirect() } /> );
		expect( await screen.findByText( 'Redirecting' ) ).toBeInTheDocument();
		expect( onPaymentRedirect.mock.calls.length ).toBe( 1 );
	} );

	it( 'calls onPaymentRedirect when transaction status is redirecting', async () => {
		const user = userEvent.setup();
		const onPaymentRedirect = jest.fn();
		render( <MyCheckout onPaymentRedirect={ onPaymentRedirect } /> );
		user.click( screen.getByText( 'Redirect' ) );
		expect( await screen.findByText( 'Redirecting' ) ).toBeInTheDocument();
		expect( onPaymentRedirect ).toHaveBeenCalled();
	} );

	it( 'does not call onPaymentError when form loads', () => {
		const onPaymentError = jest.fn();
		const { getByText } = render( <MyCheckout onPaymentError={ onPaymentError } /> );
		expect( getByText( 'Submit' ) ).not.toBeDisabled();
		expect( onPaymentError ).not.toHaveBeenCalled();
	} );

	it( 'does not call onPaymentError when transaction status is complete', async () => {
		const onPaymentError = jest.fn();
		const user = userEvent.setup();
		render( <MyCheckout onPaymentError={ onPaymentError } /> );
		user.click( screen.getByText( 'Complete' ) );
		expect( await screen.findByText( 'Form Complete' ) ).toBeInTheDocument();
		expect( onPaymentError ).not.toHaveBeenCalled();
	} );

	it( 'calls onPaymentError when transaction status is error', async () => {
		const onPaymentError = jest.fn();
		const user = userEvent.setup();
		render( <MyCheckout onPaymentError={ onPaymentError } /> );
		user.click( screen.getByText( 'Cause Error' ) );
		expect( await screen.findByText( 'Showing Error' ) ).toBeInTheDocument();
		expect( onPaymentError ).toHaveBeenCalled();
	} );

	it( 'renders form as submitting when isValidating changed from true to false and transaction is submitting', async () => {
		const onPaymentError = jest.fn();
		const user = userEvent.setup();
		render( <MyCheckout onPaymentError={ onPaymentError } /> );
		user.click( screen.getByText( 'Submit' ) );
		user.click( screen.getByText( 'Set isValidating true' ) );
		user.click( screen.getByText( 'Set isValidating false' ) );
		expect( await screen.findByText( 'Submitting' ) ).toBeInTheDocument();
	} );

	it( 'does not call onPaymentError twice when transaction status is error even if callback changes', async () => {
		const user = userEvent.setup();
		const onPaymentError = jest.fn();
		const { getByText, rerender } = render(
			<MyCheckout onPaymentError={ () => onPaymentError() } />
		);
		user.click( getByText( 'Cause Error' ) );
		rerender( <MyCheckout onPaymentError={ () => onPaymentError() } /> );
		expect( await screen.findByText( 'Showing Error' ) ).toBeInTheDocument();
		expect( onPaymentError.mock.calls.length ).toBe( 1 );
	} );
} );

function createMockMethod(): PaymentMethod {
	return {
		id: 'mock',
		paymentProcessorId: 'mock',
		label: <span data-testid="mock-label">Mock Label</span>,
		activeContent: <MockPaymentForm />,
		submitButton: <button>Pay Please</button>,
		inactiveContent: 'Mock Method',
		getAriaLabel: () => 'Mock Method',
	};
}

function MockPaymentForm( { summary }: { summary?: boolean } ) {
	const [ cardholderName, changeCardholderName ] = useState( '' );
	return (
		<div data-testid="mock-payment-form">
			<label>
				{ summary ? 'Name Summary' : 'Cardholder Name' }
				<input
					name="cardholderName"
					value={ cardholderName }
					onChange={ ( newValue ) => changeCardholderName( newValue.target.value ) }
				/>
			</label>
		</div>
	);
}
