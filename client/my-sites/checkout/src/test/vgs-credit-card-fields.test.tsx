/**
 * @jest-environment jsdom
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, act } from '@testing-library/react';
import { loadVGSCollect } from '@vgs/collect-js';
import { VGSCollectForm } from '@vgs/collect-js-react';
import { useVaultId } from '../hooks/use-vault-id';
import { VgsCreditCardFields } from '../payment-methods/credit-card/vgs-credit-card-fields';

// Mock dependencies
jest.mock( '../hooks/use-vault-id' );
jest.mock( '@vgs/collect-js', () => ( {
	loadVGSCollect: jest.fn(),
	VGS: {
		Css: {},
	},
} ) );
jest.mock( '@vgs/collect-js-react', () => ( {
	VGSCollectForm: Object.assign( jest.fn(), {
		CardholderField: jest.fn(),
		CardNumberField: jest.fn(),
		CardExpirationDateField: jest.fn(),
		CardSecurityCodeField: jest.fn(),
	} ),
} ) );
jest.mock( '@wordpress/i18n', () => ( {
	__: ( text: string ) => text,
} ) );

const mockUseVaultId = useVaultId as jest.MockedFunction< typeof useVaultId >;
const mockLoadVGSCollect = loadVGSCollect as jest.MockedFunction< typeof loadVGSCollect >;

// Mock VGS Collect Form components
const MockCardholderField = ( props: any ) => {
	const { showCardIcon, yearLength, validations, ...domProps } = props;
	return (
		<input
			id={ props.name }
			data-testid={ `cardholder-field-${ props.name }` }
			placeholder={ props.placeholder }
			className={ props.className }
			aria-label={ props.validations?.includes( 'required' ) ? 'required' : undefined }
			{ ...domProps }
		/>
	);
};

const MockCardNumberField = ( props: any ) => {
	const { showCardIcon, yearLength, validations, ...domProps } = props;
	return (
		<input
			id={ props.name }
			data-testid={ `card-number-field-${ props.name }` }
			placeholder={ props.placeholder }
			className={ props.className }
			aria-label={ props.validations?.includes( 'required' ) ? 'required' : undefined }
			{ ...domProps }
		/>
	);
};

const MockCardExpirationDateField = ( props: any ) => {
	const { showCardIcon, yearLength, validations, ...domProps } = props;
	return (
		<input
			id={ props.name }
			data-testid={ `card-expiration-field-${ props.name }` }
			placeholder={ props.placeholder }
			className={ props.className }
			aria-label={ props.validations?.includes( 'required' ) ? 'required' : undefined }
			{ ...domProps }
		/>
	);
};

const MockCardSecurityCodeField = ( props: any ) => {
	const { showCardIcon, yearLength, validations, ...domProps } = props;
	return (
		<input
			id={ props.name }
			data-testid={ `card-security-field-${ props.name }` }
			placeholder={ props.placeholder }
			className={ props.className }
			aria-label={ props.validations?.includes( 'required' ) ? 'required' : undefined }
			{ ...domProps }
		/>
	);
};

const MockVGSCollectForm = ( { children, vaultId, environment }: any ) => (
	<div data-testid="vgs-collect-form" data-vault-id={ vaultId } data-environment={ environment }>
		{ children }
	</div>
);

// Set up the mocked VGSCollectForm
( VGSCollectForm as jest.MockedFunction< typeof VGSCollectForm > ).mockImplementation(
	MockVGSCollectForm
);
( VGSCollectForm as any ).CardholderField.mockImplementation( MockCardholderField );
( VGSCollectForm as any ).CardNumberField.mockImplementation( MockCardNumberField );
( VGSCollectForm as any ).CardExpirationDateField.mockImplementation( MockCardExpirationDateField );
( VGSCollectForm as any ).CardSecurityCodeField.mockImplementation( MockCardSecurityCodeField );

// Test wrapper component
const createWrapper = () => {
	const queryClient = new QueryClient( {
		defaultOptions: {
			queries: {
				retry: false,
			},
		},
	} );

	return ( { children }: { children: React.ReactNode } ) => (
		<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
	);
};

// Helper function to render with act and wait for async updates
const renderWithAct = async ( component: React.ReactElement, options?: any ) => {
	let result: any;
	await act( async () => {
		result = render( component, options );
		// Flush pending promises to allow useEffect to complete
		await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );
	} );
	return result;
};

describe( 'VgsCreditCardFields', () => {
	const mockVaultConfig = {
		vault_id: 'test-vault-id',
		environment: 'sandbox' as const,
	};

	// Store original console.error
	const originalError = console.error;

	beforeAll( () => {
		// Suppress act() warnings - these occur because loadVGSCollect resolves asynchronously
		// in the component's useEffect, which is outside React's render tracking.
		// The tests properly wait for these updates with waitFor(), so the warnings are safe to suppress.
		console.error = ( ...args: any[] ) => {
			const message = args[ 0 ];
			if ( typeof message === 'string' && message.includes( 'not wrapped in act' ) ) {
				return;
			}
			originalError.call( console, ...args );
		};
	} );

	afterAll( () => {
		// Restore original console.error
		console.error = originalError;
	} );

	beforeEach( () => {
		jest.clearAllMocks();
		// Use mockImplementation with Promise.resolve to ensure async state updates
		// are properly handled within act() boundaries
		mockLoadVGSCollect.mockImplementation( () => Promise.resolve( {} as any ) );
	} );

	// Default props for tests
	const defaultLabels = {
		cardholderName: 'Cardholder name',
		cardNumber: 'Card number',
		expiryDate: 'Expiry date',
		cvc: 'Security code',
	};

	const defaultPlaceholders = {
		cardholderName: '',
		cardNumber: '•••• •••• •••• ••••',
		expiryDate: 'MM/YY',
		cvc: 'CVC',
	};

	describe( 'Loading State', () => {
		it( 'should show loading state when vault config is not loaded', () => {
			mockUseVaultId.mockReturnValue( {
				data: undefined,
				isSuccess: false,
				error: null,
			} as any );

			render(
				<VgsCreditCardFields labels={ defaultLabels } placeholders={ defaultPlaceholders } />,
				{
					wrapper: createWrapper(),
				}
			);

			expect( screen.getByText( 'Loading payment form...' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Loading payment form...' ) ).toHaveClass( 'vgs-loading' );
		} );

		it( 'should show loading state when VGS script is not loaded', () => {
			mockUseVaultId.mockReturnValue( {
				data: mockVaultConfig,
				isSuccess: true,
				error: null,
			} as any );

			render(
				<VgsCreditCardFields labels={ defaultLabels } placeholders={ defaultPlaceholders } />,
				{
					wrapper: createWrapper(),
				}
			);

			expect( screen.getByText( 'Loading payment form...' ) ).toBeInTheDocument();
		} );
	} );

	describe( 'Error Handling', () => {
		it( 'should return null when vault configuration fails', () => {
			const mockOnVgsFormError = jest.fn();
			mockUseVaultId.mockReturnValue( {
				data: undefined,
				isSuccess: false,
				error: new Error( 'Vault configuration failed' ),
			} as any );

			const { container } = render(
				<VgsCreditCardFields
					labels={ defaultLabels }
					placeholders={ defaultPlaceholders }
					onVgsFormError={ mockOnVgsFormError }
				/>,
				{
					wrapper: createWrapper(),
				}
			);

			expect( container.firstChild ).toBeNull();
			expect( mockOnVgsFormError ).toHaveBeenCalledWith(
				'Failed to load payment configuration. Please try again.'
			);
		} );

		it( 'should return null when VGS script loading fails', async () => {
			const mockOnVgsFormError = jest.fn();
			mockUseVaultId.mockReturnValue( {
				data: mockVaultConfig,
				isSuccess: true,
				error: null,
			} as any );

			mockLoadVGSCollect.mockRejectedValue( new Error( 'Script loading failed' ) );

			const { container } = render(
				<VgsCreditCardFields
					labels={ defaultLabels }
					placeholders={ defaultPlaceholders }
					onVgsFormError={ mockOnVgsFormError }
				/>,
				{
					wrapper: createWrapper(),
				}
			);

			await waitFor( () => {
				expect( container.firstChild ).toBeNull();
			} );

			expect( mockOnVgsFormError ).toHaveBeenCalledWith(
				'Failed to load payment form. Please refresh the page.'
			);
		} );
	} );

	describe( 'Successful Rendering', () => {
		beforeEach( () => {
			mockUseVaultId.mockReturnValue( {
				data: mockVaultConfig,
				isSuccess: true,
				error: null,
			} as any );
		} );

		it( 'should render VGS form with correct props when script loads successfully', async () => {
			await renderWithAct(
				<VgsCreditCardFields labels={ defaultLabels } placeholders={ defaultPlaceholders } />,
				{ wrapper: createWrapper() }
			);

			await waitFor( () => {
				expect( screen.getByTestId( 'vgs-collect-form' ) ).toBeInTheDocument();
			} );

			const form = screen.getByTestId( 'vgs-collect-form' );
			expect( form ).toHaveAttribute( 'data-vault-id', 'test-vault-id' );
			expect( form ).toHaveAttribute( 'data-environment', 'sandbox' );
		} );

		it( 'should render all form fields with correct labels and placeholders', async () => {
			await renderWithAct(
				<VgsCreditCardFields labels={ defaultLabels } placeholders={ defaultPlaceholders } />,
				{ wrapper: createWrapper() }
			);

			await waitFor( () => {
				expect( screen.getByTestId( 'vgs-collect-form' ) ).toBeInTheDocument();
			} );

			// Check labels
			expect( screen.getByText( 'Cardholder name' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Card number' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Expiry date' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Security code' ) ).toBeInTheDocument();

			// Check form fields
			expect( screen.getByTestId( 'cardholder-field-card_holder' ) ).toBeInTheDocument();
			expect( screen.getByTestId( 'card-number-field-card_number' ) ).toBeInTheDocument();
			expect( screen.getByTestId( 'card-expiration-field-card_exp' ) ).toBeInTheDocument();
			expect( screen.getByTestId( 'card-security-field-card_cvc' ) ).toBeInTheDocument();

			// Check placeholders
			expect( screen.getByPlaceholderText( '•••• •••• •••• ••••' ) ).toBeInTheDocument();
			expect( screen.getByPlaceholderText( 'MM/YY' ) ).toBeInTheDocument();
			expect( screen.getByPlaceholderText( 'CVC' ) ).toBeInTheDocument();
		} );

		it( 'should render future charge notice when enabled with label', async () => {
			const labelsWithNotice = {
				...defaultLabels,
				futureChargeNotice:
					'By providing your card information, you allow your card be charged for future payments.',
			};

			await renderWithAct(
				<VgsCreditCardFields
					labels={ labelsWithNotice }
					placeholders={ defaultPlaceholders }
					showFutureChargeNotice
				/>,
				{ wrapper: createWrapper() }
			);

			await waitFor( () => {
				expect( screen.getByTestId( 'vgs-collect-form' ) ).toBeInTheDocument();
			} );

			expect( screen.getByTestId( 'future-use-text' ) ).toBeInTheDocument();
			expect(
				screen.getByText(
					'By providing your card information, you allow your card be charged for future payments.'
				)
			).toBeInTheDocument();
		} );

		it( 'should not render future charge notice when showFutureChargeNotice is false', async () => {
			await renderWithAct(
				<VgsCreditCardFields
					labels={ defaultLabels }
					placeholders={ defaultPlaceholders }
					showFutureChargeNotice={ false }
				/>,
				{
					wrapper: createWrapper(),
				}
			);

			await waitFor( () => {
				expect( screen.getByTestId( 'vgs-collect-form' ) ).toBeInTheDocument();
			} );

			expect( screen.queryByTestId( 'future-use-text' ) ).not.toBeInTheDocument();
		} );

		it( 'should not render future charge notice when label is missing', async () => {
			await renderWithAct(
				<VgsCreditCardFields
					labels={ defaultLabels }
					placeholders={ defaultPlaceholders }
					showFutureChargeNotice
				/>,
				{
					wrapper: createWrapper(),
				}
			);

			await waitFor( () => {
				expect( screen.getByTestId( 'vgs-collect-form' ) ).toBeInTheDocument();
			} );

			expect( screen.queryByTestId( 'future-use-text' ) ).not.toBeInTheDocument();
		} );
	} );

	describe( 'Custom Styles', () => {
		beforeEach( () => {
			mockUseVaultId.mockReturnValue( {
				data: mockVaultConfig,
				isSuccess: true,
				error: null,
			} as any );
		} );

		it( 'should apply default styles when no custom styles provided', async () => {
			await renderWithAct(
				<VgsCreditCardFields labels={ defaultLabels } placeholders={ defaultPlaceholders } />,
				{ wrapper: createWrapper() }
			);

			await waitFor( () => {
				expect( screen.getByTestId( 'vgs-collect-form' ) ).toBeInTheDocument();
			} );

			const cardholderField = screen.getByTestId( 'cardholder-field-card_holder' );
			// VGS library uses CSS-in-JS, so we check for className pattern instead of exact match
			expect( cardholderField.className ).toMatch( /^css-\w+-VgsCreditCardFields$/ );
		} );

		it( 'should merge custom styles with default styles', async () => {
			const customStyles = {
				input: {
					backgroundColor: '#f0f0f0',
					borderColor: '#ff0000',
				},
			};

			await renderWithAct(
				<VgsCreditCardFields
					labels={ defaultLabels }
					placeholders={ defaultPlaceholders }
					styles={ customStyles }
				/>,
				{
					wrapper: createWrapper(),
				}
			);

			await waitFor( () => {
				expect( screen.getByTestId( 'vgs-collect-form' ) ).toBeInTheDocument();
			} );

			const cardholderField = screen.getByTestId( 'cardholder-field-card_holder' );
			// VGS library uses CSS-in-JS, so we check for className pattern instead of exact match
			expect( cardholderField.className ).toMatch( /^css-\w+-VgsCreditCardFields$/ );
		} );
	} );

	describe( 'VGS Script Loading', () => {
		it( 'should call loadVGSCollect with correct parameters', async () => {
			mockUseVaultId.mockReturnValue( {
				data: mockVaultConfig,
				isSuccess: true,
				error: null,
			} as any );

			await renderWithAct(
				<VgsCreditCardFields labels={ defaultLabels } placeholders={ defaultPlaceholders } />,
				{ wrapper: createWrapper() }
			);

			await waitFor( () => {
				expect( mockLoadVGSCollect ).toHaveBeenCalledWith( {
					vaultId: 'test-vault-id',
					environment: 'sandbox',
					version: '3.2.2',
				} );
			} );
		} );

		it( 'should only call loadVGSCollect once even with multiple re-renders', async () => {
			mockUseVaultId.mockReturnValue( {
				data: mockVaultConfig,
				isSuccess: true,
				error: null,
			} as any );

			const { rerender } = await renderWithAct(
				<VgsCreditCardFields labels={ defaultLabels } placeholders={ defaultPlaceholders } />,
				{
					wrapper: createWrapper(),
				}
			);

			// Re-render the component
			await act( async () => {
				rerender(
					<VgsCreditCardFields labels={ defaultLabels } placeholders={ defaultPlaceholders } />
				);
			} );

			await waitFor( () => {
				expect( mockLoadVGSCollect ).toHaveBeenCalledTimes( 1 );
			} );
		} );
	} );

	describe( 'Custom Labels, Placeholders, and Descriptions', () => {
		beforeEach( () => {
			mockUseVaultId.mockReturnValue( {
				data: mockVaultConfig,
				isSuccess: true,
				error: null,
			} as any );
		} );

		it( 'should render custom labels when provided', async () => {
			const customLabels = {
				cardholderName: 'Name on Card',
				cardNumber: 'Card Number',
				expiryDate: 'Expiration',
				cvc: 'CVV',
			};

			await renderWithAct(
				<VgsCreditCardFields labels={ customLabels } placeholders={ defaultPlaceholders } />,
				{ wrapper: createWrapper() }
			);

			await waitFor( () => {
				expect( screen.getByTestId( 'vgs-collect-form' ) ).toBeInTheDocument();
			} );

			expect( screen.getByText( 'Name on Card' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Card Number' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Expiration' ) ).toBeInTheDocument();
			expect( screen.getByText( 'CVV' ) ).toBeInTheDocument();
		} );

		it( 'should render custom placeholders when provided', async () => {
			const customPlaceholders = {
				cardholderName: 'John Doe',
				cardNumber: '1234 5678 9012 3456',
				expiryDate: '12/25',
				cvc: '123',
			};

			await renderWithAct(
				<VgsCreditCardFields labels={ defaultLabels } placeholders={ customPlaceholders } />,
				{ wrapper: createWrapper() }
			);

			await waitFor( () => {
				expect( screen.getByTestId( 'vgs-collect-form' ) ).toBeInTheDocument();
			} );

			expect( screen.getByPlaceholderText( 'John Doe' ) ).toBeInTheDocument();
			expect( screen.getByPlaceholderText( '1234 5678 9012 3456' ) ).toBeInTheDocument();
			expect( screen.getByPlaceholderText( '12/25' ) ).toBeInTheDocument();
			expect( screen.getByPlaceholderText( '123' ) ).toBeInTheDocument();
		} );

		it( 'should render descriptions when provided', async () => {
			const descriptions = {
				cardholderName: 'Enter name as shown on card',
				cardNumber: 'Enter card number without spaces',
			};

			await renderWithAct(
				<VgsCreditCardFields
					labels={ defaultLabels }
					placeholders={ defaultPlaceholders }
					descriptions={ descriptions }
				/>,
				{ wrapper: createWrapper() }
			);

			await waitFor( () => {
				expect( screen.getByTestId( 'vgs-collect-form' ) ).toBeInTheDocument();
			} );

			expect( screen.getByText( 'Enter name as shown on card' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Enter card number without spaces' ) ).toBeInTheDocument();
		} );
	} );
} );
