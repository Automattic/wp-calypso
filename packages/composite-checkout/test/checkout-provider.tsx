import { render, fireEvent } from '@testing-library/react';
import { useState } from 'react';
import {
	CheckoutProvider,
	FormStatus,
	PaymentMethod,
	TransactionStatus,
	useFormStatus,
	useTransactionStatus,
} from '../src/public-api';

const CustomFormWithFormStatus = () => {
	const { formStatus, setFormComplete, setFormLoading, setFormSubmitting } = useFormStatus();
	if ( formStatus === FormStatus.LOADING ) {
		return <div>Loading</div>;
	}
	if ( formStatus === FormStatus.SUBMITTING ) {
		return <div>Submitting</div>;
	}
	if ( formStatus === FormStatus.COMPLETE ) {
		return <div>Form Complete</div>;
	}
	return (
		<div>
			<input type="text" />
			<button disabled={ formStatus !== FormStatus.READY } onClick={ setFormLoading }>
				Load
			</button>
			<button disabled={ formStatus !== FormStatus.READY } onClick={ setFormSubmitting }>
				Submit
			</button>
			<button disabled={ formStatus !== FormStatus.READY } onClick={ setFormComplete }>
				Complete
			</button>
		</div>
	);
};

const CustomFormWithTransactionStatus = () => {
	const { formStatus } = useFormStatus();
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
	if ( formStatus === FormStatus.SUBMITTING ) {
		return <div>Submitting</div>;
	}
	if ( formStatus === FormStatus.COMPLETE ) {
		return <div>Form Complete</div>;
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

	describe( 'with formStatus directly', () => {
		beforeEach( () => {
			MyCheckout = ( { onPaymentComplete, isLoading, onPaymentError, onPaymentRedirect } ) => (
				<CheckoutProvider
					isLoading={ isLoading || null }
					onPaymentComplete={ onPaymentComplete }
					onPaymentError={ onPaymentError }
					onPaymentRedirect={ onPaymentRedirect }
					paymentMethods={ [ mockMethod ] }
					paymentProcessors={ {} }
					initiallySelectedPaymentMethodId={ mockMethod.id }
				>
					<CustomFormWithFormStatus />
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
			expect( queryByText( 'Submitting' ) ).not.toBeInTheDocument();
			fireEvent.click( getByText( 'Submit' ) );
			expect( getByText( 'Submitting' ) ).toBeInTheDocument();
		} );

		it( 'sets form status to complete when setFormComplete is called', () => {
			const { getByText, queryByText } = render( <MyCheckout /> );
			expect( queryByText( 'Form Complete' ) ).not.toBeInTheDocument();
			fireEvent.click( getByText( 'Complete' ) );
			expect( getByText( 'Form Complete' ) ).toBeInTheDocument();
		} );

		it( 'sets form status to loading when setFormLoading is called', () => {
			const { getByText, queryByText } = render( <MyCheckout /> );
			expect( queryByText( 'Loading' ) ).not.toBeInTheDocument();
			fireEvent.click( getByText( 'Load' ) );
			expect( getByText( 'Loading' ) ).toBeInTheDocument();
		} );

		it( 'does not call onPaymentComplete when form status is not complete', () => {
			const onPaymentComplete = jest.fn();
			const { getByText } = render( <MyCheckout onPaymentComplete={ onPaymentComplete } /> );
			expect( getByText( 'Submit' ) ).not.toBeDisabled();
			expect( onPaymentComplete ).not.toHaveBeenCalled();
		} );

		it( 'calls onPaymentComplete when form status is complete', () => {
			const onPaymentComplete = jest.fn();
			const { getByText } = render( <MyCheckout onPaymentComplete={ onPaymentComplete } /> );
			fireEvent.click( getByText( 'Complete' ) );
			expect( getByText( 'Form Complete' ) ).toBeInTheDocument();
			expect( onPaymentComplete ).toHaveBeenCalled();
		} );

		it( 'does not call onPaymentComplete twice when form status is complete even if callback changes', () => {
			const onPaymentComplete = jest.fn();
			const { getByText, rerender } = render(
				<MyCheckout onPaymentComplete={ () => onPaymentComplete() } />
			);
			fireEvent.click( getByText( 'Complete' ) );
			rerender( <MyCheckout onPaymentComplete={ () => onPaymentComplete() } /> );
			expect( onPaymentComplete.mock.calls.length ).toBe( 1 );
		} );
	} );

	describe( 'with transactionStatus directly', () => {
		beforeEach( () => {
			MyCheckout = ( { onPaymentComplete, isLoading, onPaymentError, onPaymentRedirect } ) => (
				<CheckoutProvider
					isLoading={ isLoading || null }
					onPaymentComplete={ onPaymentComplete }
					onPaymentError={ onPaymentError }
					onPaymentRedirect={ onPaymentRedirect }
					paymentMethods={ [ mockMethod ] }
					paymentProcessors={ {} }
					initiallySelectedPaymentMethodId={ mockMethod.id }
				>
					<CustomFormWithTransactionStatus />
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

		it( 'sets form status to submitting when setTransactionPending is called', () => {
			const { getByText, queryByText } = render( <MyCheckout /> );
			expect( queryByText( 'Submitting' ) ).not.toBeInTheDocument();
			fireEvent.click( getByText( 'Submit' ) );
			expect( getByText( 'Submitting' ) ).toBeInTheDocument();
		} );

		it( 'sets form status to complete when setTransactionComplete is called', () => {
			const { getByText, queryByText } = render( <MyCheckout /> );
			expect( queryByText( 'Form Complete' ) ).not.toBeInTheDocument();
			fireEvent.click( getByText( 'Complete' ) );
			expect( getByText( 'Form Complete' ) ).toBeInTheDocument();
		} );

		it( 'sets form status to ready when setTransactionError is called', () => {
			const { getByText, queryByText } = render( <MyCheckout /> );
			expect( queryByText( 'Showing Error' ) ).not.toBeInTheDocument();
			fireEvent.click( getByText( 'Cause Error' ) );
			expect( getByText( 'Showing Error' ) ).toBeInTheDocument();
		} );

		it( 'does not call onPaymentComplete when form loads', () => {
			const onPaymentComplete = jest.fn();
			const { getByText } = render( <MyCheckout onPaymentComplete={ onPaymentComplete } /> );
			expect( getByText( 'Submit' ) ).not.toBeDisabled();
			expect( onPaymentComplete ).not.toHaveBeenCalled();
		} );

		it( 'calls onPaymentComplete when form status is complete', () => {
			const onPaymentComplete = jest.fn();
			const { getByText } = render( <MyCheckout onPaymentComplete={ onPaymentComplete } /> );
			fireEvent.click( getByText( 'Complete' ) );
			expect( getByText( 'Form Complete' ) ).toBeInTheDocument();
			expect( onPaymentComplete ).toHaveBeenCalled();
		} );

		it( 'does not call onPaymentRedirect when form loads', () => {
			const onPaymentRedirect = jest.fn();
			const { getByText } = render( <MyCheckout onPaymentRedirect={ onPaymentRedirect } /> );
			expect( getByText( 'Submit' ) ).not.toBeDisabled();
			expect( onPaymentRedirect ).not.toHaveBeenCalled();
		} );

		it( 'does not call onPaymentRedirect when transaction status is complete', () => {
			const onPaymentRedirect = jest.fn();
			const { getByText } = render( <MyCheckout onPaymentRedirect={ onPaymentRedirect } /> );
			fireEvent.click( getByText( 'Complete' ) );
			expect( getByText( 'Form Complete' ) ).toBeInTheDocument();
			expect( onPaymentRedirect ).not.toHaveBeenCalled();
		} );

		it( 'does not call onPaymentRedirect twice when transaction status is redirecting even if callback changes', () => {
			const onPaymentRedirect = jest.fn();
			const { getByText, rerender } = render(
				<MyCheckout onPaymentRedirect={ () => onPaymentRedirect() } />
			);
			fireEvent.click( getByText( 'Redirect' ) );
			rerender( <MyCheckout onPaymentRedirect={ () => onPaymentRedirect() } /> );
			expect( onPaymentRedirect.mock.calls.length ).toBe( 1 );
		} );

		it( 'calls onPaymentRedirect when transaction status is redirecting', () => {
			const onPaymentRedirect = jest.fn();
			const { getByText } = render( <MyCheckout onPaymentRedirect={ onPaymentRedirect } /> );
			fireEvent.click( getByText( 'Redirect' ) );
			expect( getByText( 'Redirecting' ) ).toBeInTheDocument();
			expect( onPaymentRedirect ).toHaveBeenCalled();
		} );

		it( 'does not call onPaymentError when form loads', () => {
			const onPaymentError = jest.fn();
			const { getByText } = render( <MyCheckout onPaymentError={ onPaymentError } /> );
			expect( getByText( 'Submit' ) ).not.toBeDisabled();
			expect( onPaymentError ).not.toHaveBeenCalled();
		} );

		it( 'does not call onPaymentError when transaction status is complete', () => {
			const onPaymentError = jest.fn();
			const { getByText } = render( <MyCheckout onPaymentError={ onPaymentError } /> );
			fireEvent.click( getByText( 'Complete' ) );
			expect( getByText( 'Form Complete' ) ).toBeInTheDocument();
			expect( onPaymentError ).not.toHaveBeenCalled();
		} );

		it( 'calls onPaymentError when transaction status is error', () => {
			const onPaymentError = jest.fn();
			const { getByText } = render( <MyCheckout onPaymentError={ onPaymentError } /> );
			fireEvent.click( getByText( 'Cause Error' ) );
			expect( getByText( 'Showing Error' ) ).toBeInTheDocument();
			expect( onPaymentError ).toHaveBeenCalled();
		} );

		it( 'does not call onPaymentError twice when transaction status is error even if callback changes', () => {
			const onPaymentError = jest.fn();
			const { getByText, rerender } = render(
				<MyCheckout onPaymentError={ () => onPaymentError() } />
			);
			fireEvent.click( getByText( 'Cause Error' ) );
			rerender( <MyCheckout onPaymentError={ () => onPaymentError() } /> );
			expect( onPaymentError.mock.calls.length ).toBe( 1 );
		} );
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
