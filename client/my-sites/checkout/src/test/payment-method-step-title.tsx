/**
 * @jest-environment jsdom
 */
import {
	CheckoutProvider,
	CheckoutStep,
	CheckoutStepGroup,
	PaymentMethodStep,
	createCheckoutStepGroupStore,
	useTogglePaymentMethod,
	usePaymentMethodId,
} from '@automattic/composite-checkout';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { defaultI18n } from '@wordpress/i18n';
import { I18nProvider } from '@wordpress/react-i18n';
import CreditCardLogos from '../components/credit-card-logos';
import PaymentMethodStepTitle from '../components/payment-method-step-title';
import type { PaymentMethod } from '@automattic/composite-checkout';

jest.mock( '../components/payment-logos', () => ( {
	VisaLogo: () => <svg data-testid="visa-logo" />,
	MastercardLogo: () => <svg data-testid="mastercard-logo" />,
	AmexLogo: () => <svg data-testid="amex-logo" />,
	CBLogo: () => <svg data-testid="cb-logo" />,
	JcbLogo: () => <svg data-testid="jcb-logo" />,
} ) );

function ToggleCardAvailability() {
	const togglePaymentMethod = useTogglePaymentMethod();
	const [ , setPaymentMethodId ] = usePaymentMethodId();
	return (
		<>
			<button onClick={ () => togglePaymentMethod( 'card', false ) }>Disable card payments</button>
			<button onClick={ () => togglePaymentMethod( 'card', true ) }>Enable card payments</button>
			<button onClick={ () => setPaymentMethodId( 'card' ) }>Select card payments</button>
		</>
	);
}

function renderPaymentStep( {
	currency = 'USD',
	isMobileCheckoutStickySummary = false,
	methodId = 'card',
	selectedMethodId = methodId,
	isContactComplete = false,
	isPaymentComplete = false,
}: {
	currency?: string;
	isMobileCheckoutStickySummary?: boolean;
	methodId?: string;
	selectedMethodId?: string;
	isContactComplete?: boolean;
	isPaymentComplete?: boolean;
} = {} ) {
	const store = createCheckoutStepGroupStore();
	const logoProps = { currency, isMobileCheckoutStickySummary };
	const method: PaymentMethod = {
		id: methodId,
		paymentProcessorId: methodId,
		label: (
			<>
				Credit or debit card
				<CreditCardLogos { ...logoProps } />
			</>
		),
		inactiveContent: <p>Visa ending in 1234</p>,
		submitButton: <button>Pay</button>,
		getAriaLabel: () => 'Credit card',
	};
	const selectedMethod: PaymentMethod = {
		id: selectedMethodId,
		paymentProcessorId: selectedMethodId,
		label: selectedMethodId === 'paypal' ? 'PayPal' : 'Saved card',
		inactiveContent: <p>{ selectedMethodId === 'paypal' ? 'PayPal' : 'Visa ending in 1234' }</p>,
		submitButton: <button>Pay</button>,
		getAriaLabel: () => selectedMethodId,
	};
	render(
		<CheckoutProvider
			paymentMethods={ selectedMethodId === methodId ? [ method ] : [ method, selectedMethod ] }
			paymentProcessors={ {} }
			initiallySelectedPaymentMethodId={ selectedMethodId }
		>
			<ToggleCardAvailability />
			<CheckoutStepGroup store={ store }>
				<CheckoutStep
					stepId="contact"
					titleContent="Contact information"
					isCompleteCallback={ () => isContactComplete }
					activeStepContent={ <input aria-label="Postal code" /> }
				/>
				<PaymentMethodStep
					titleContent={ <PaymentMethodStepTitle { ...logoProps } /> }
					isCompleteCallback={ () => isPaymentComplete }
					canEditStep
					editButtonAriaLabel="Edit the payment method"
				/>
			</CheckoutStepGroup>
		</CheckoutProvider>,
		{
			wrapper: ( { children } ) => <I18nProvider i18n={ defaultI18n }>{ children }</I18nProvider>,
		}
	);
	return store;
}

function getPaymentHeading() {
	return screen.getByRole( 'heading', { name: /(?:Pick a payment method|Payment method)/ } );
}

describe( 'PaymentMethodStepTitle', () => {
	it.each( [
		[ 'USD', false, null, null ],
		[ 'EUR', false, 'cb-logo', null ],
		[ 'JPY', false, 'jcb-logo', null ],
		[ 'USD', true, null, null ],
		[ 'EUR', true, null, '+1' ],
		[ 'JPY', true, null, '+1' ],
	] )(
		'shows the accepted brands for %s with compact mode %s',
		( currency, compact, extraBrand, overflow ) => {
			renderPaymentStep( { currency, isMobileCheckoutStickySummary: compact } );
			const heading = getPaymentHeading();
			const logos = within( heading );
			expect( logos.getByTestId( 'visa-logo' ) ).toBeInTheDocument();
			expect( logos.getByTestId( 'mastercard-logo' ) ).toBeInTheDocument();
			expect( logos.getByTestId( 'amex-logo' ) ).toBeInTheDocument();
			expect( logos.queryByTestId( 'cb-logo' ) !== null ).toBe( extraBrand === 'cb-logo' );
			expect( logos.queryByTestId( 'jcb-logo' ) !== null ).toBe( extraBrand === 'jcb-logo' );
			expect( logos.queryByText( '+1' ) !== null ).toBe( overflow === '+1' );
			expect( heading ).toHaveTextContent( compact ? 'Payment method' : 'Pick a payment method' );
			expect( heading.querySelector( '[aria-hidden="true"] .credit-card__logos' ) ).toBeVisible();
		}
	);

	it.each( [ 'paypal', 'free-purchase' ] )(
		'does not advertise cards for a %s-only checkout',
		( methodId ) => {
			renderPaymentStep( { methodId } );
			expect( getPaymentHeading().querySelector( '.credit-card__logos' ) ).not.toBeInTheDocument();
		}
	);

	it( 'updates the heading when card availability changes', async () => {
		const user = userEvent.setup();
		renderPaymentStep();
		await user.click( screen.getByRole( 'button', { name: 'Disable card payments' } ) );
		expect( getPaymentHeading().querySelector( '.credit-card__logos' ) ).not.toBeInTheDocument();
		await user.click( screen.getByRole( 'button', { name: 'Enable card payments' } ) );
		expect( getPaymentHeading().querySelector( '.credit-card__logos' ) ).toBeVisible();
	} );

	it( 'keeps the strip inside the card option while the payment step is active', async () => {
		const store = renderPaymentStep();
		act( () => store.actions.setActiveStepNumber( 2 ) );
		await waitFor( () => {
			expect( getPaymentHeading().querySelector( '.credit-card__logos' ) ).not.toBeInTheDocument();
		} );
		const content = screen.getByTestId( 'payment-method-step--visible' );
		expect( content.querySelector( '.credit-card__logos' ) ).toBeVisible();
		await waitFor( () =>
			expect( getPaymentHeading() ).toHaveTextContent( 'Pick a payment method' )
		);
	} );

	it.each( [ 'paypal', 'existing-card' ] )(
		'uses the small-phone visibility rule when %s is selected',
		async ( selectedMethodId ) => {
			const user = userEvent.setup();
			renderPaymentStep( { selectedMethodId } );
			expect( getPaymentHeading().querySelector( '.credit-card__logos' ) ).not.toBeVisible();
			await user.click( screen.getByRole( 'button', { name: 'Select card payments' } ) );
			expect( getPaymentHeading().querySelector( '.credit-card__logos' ) ).toBeVisible();
		}
	);

	it.each( [
		[ 'card', 'Visa ending in 1234' ],
		[ 'existing-card', 'Visa ending in 1234' ],
		[ 'paypal', 'PayPal' ],
	] )(
		'hides heading logos after completing payment with %s and preserves Edit',
		async ( selectedMethodId, summary ) => {
			const user = userEvent.setup();
			const store = renderPaymentStep( {
				selectedMethodId,
				isContactComplete: true,
				isPaymentComplete: true,
			} );
			act( () => store.actions.setStepCompleteStatus( { 1: true, 2: true } ) );
			await waitFor( () => expect( screen.getByText( summary, { selector: 'p' } ) ).toBeVisible() );
			expect( getPaymentHeading() ).toHaveTextContent( 'Payment method' );
			expect( getPaymentHeading().querySelector( '.credit-card__logos' ) ).not.toBeInTheDocument();
			await user.click( screen.getByRole( 'button', { name: 'Edit the payment method' } ) );
			await waitFor( () => {
				expect(
					getPaymentHeading().querySelector( '.credit-card__logos' )
				).not.toBeInTheDocument();
			} );
			expect( getPaymentHeading() ).toHaveTextContent( 'Pick a payment method' );
		}
	);

	it( 'updates both title variants when WordPress translations load', async () => {
		const user = userEvent.setup();
		const localeData = defaultI18n.getLocaleData();
		const store = renderPaymentStep( { isContactComplete: true, isPaymentComplete: true } );
		act( () => store.actions.setStepCompleteStatus( { 1: true, 2: true } ) );
		await waitFor( () => expect( getPaymentHeading() ).toHaveTextContent( 'Payment method' ) );

		try {
			act( () => {
				defaultI18n.setLocaleData( {
					'': { domain: 'default', lang: 'de' },
					'Payment method': [ 'Zahlungsmethode' ],
					'Pick a payment method': [ 'Wählen Sie eine Zahlungsmethode aus' ],
				} );
			} );
			expect( screen.getByRole( 'heading', { name: /Zahlungsmethode$/ } ) ).toBeVisible();

			await user.click( screen.getByRole( 'button', { name: 'Edit the payment method' } ) );
			await waitFor( () =>
				expect(
					screen.getByRole( 'heading', { name: /Wählen Sie eine Zahlungsmethode aus$/ } )
				).toBeVisible()
			);
		} finally {
			act( () => defaultI18n.resetLocaleData( localeData ) );
		}
	} );
} );
