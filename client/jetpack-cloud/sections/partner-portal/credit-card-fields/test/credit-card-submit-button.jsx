/**
 * @jest-environment jsdom
 */

import { useFormStatus } from '@automattic/composite-checkout';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import * as actions from 'calypso/state/partner-portal/credit-card-form/actions';
import * as selectors from 'calypso/state/partner-portal/credit-card-form/selectors';
import CreditCardSubmitButton from '../credit-card-submit-button';

jest.mock( '@stripe/stripe-js', () => ( {
	loadStripe: () => null,
} ) );

jest.mock( 'calypso/state/partner-portal/credit-card-form/selectors', () => {
	const items = jest.requireActual( 'calypso/state/partner-portal/credit-card-form/selectors' );
	return {
		...items,
		getFields: () => {
			return {
				cardholderName: { value: 'Test card' },
			};
		},
		getCardDataErrors: () => {
			return {};
		},
		getIncompleteFieldKeys: () => {
			return {
				cardDataComplete: {},
			};
		},
	};
} );
jest.mock( 'calypso/state/partner-portal/credit-card-form/actions' );

jest.mock( '@automattic/composite-checkout', () => {
	const button = jest.requireActual( '@automattic/composite-checkout' ).Button;
	const buttonComponent = ( args ) => {
		const props = {
			...args,
			theme: {
				colors: { borderColor: '#000' },
				weights: { normal: 500 },
			},
		};
		return button( props );
	};
	return {
		useFormStatus: jest.fn(),
		FormStatus: {
			LOADING: 'loading',
			READY: 'ready',
			SUBMITTING: 'submitting',
			VALIDATING: 'validating',
			COMPLETE: 'complete',
		},
		Button: buttonComponent,
	};
} );

describe( '<CreditCardSubmitButton>', () => {
	beforeEach( () => {
		// Re-mock dependencies
		jest.clearAllMocks();
		useFormStatus.mockImplementation( () => {
			return {
				formStatus: 'ready',
				setFormReady: jest.fn(),
			};
		} );
	} );

	afterEach( () => {
		useFormStatus.mockClear();
	} );

	test( 'should render correctly, and fire event correctly', async () => {
		const initialState = {};
		const mockStore = configureStore();

		const store = mockStore( initialState );
		const newStore = {
			...store,
			selectors,
			actions,
			dispatch: () => false,
		};

		const stripeConfiguration = { public_key: 'test', js_url: 'test', processor_id: '1234' };

		const stripe = await loadStripe( stripeConfiguration.public_key, {
			locale: 'en',
		} );

		const buttonText = 'Save payment method';

		const props = {
			stripe,
			stripeConfiguration,
			disabled: false,
			onClick: jest.fn(),
			activeButtonText: buttonText,
		};

		const { container } = render(
			<Provider store={ newStore }>
				<Elements stripe={ stripe }>
					<CreditCardSubmitButton { ...props } />
				</Elements>
			</Provider>
		);

		expect( screen.getByText( buttonText ) ).toBeInTheDocument();

		const [ button ] = container.getElementsByTagName( 'button' );

		await userEvent.click( button );

		expect( props.onClick ).toHaveBeenCalled();
	} );
} );
