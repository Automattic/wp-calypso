/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../test-utils';
import NameServersForm from '../form';

// Mock InlineSupportLink to render a simple link
jest.mock( '../../../components/inline-support-link', () => ( {
	__esModule: true,
	default: ( { supportContext }: { supportContext: string } ) => (
		// eslint-disable-next-line jsx-a11y/anchor-is-valid
		<a href="#" data-support-context={ supportContext }>
			Look up
		</a>
	),
} ) );

describe( 'NameServersForm', () => {
	const defaultProps = {
		domainName: 'example.com',
		domainSiteSlug: 'example.wordpress.com',
		nameServers: [],
		isUsingDefaultNameServers: false,
		isBusy: false,
		onSubmit: jest.fn(),
		defaultNameServers: [ 'ns1.wordpress.com', 'ns2.wordpress.com', 'ns3.wordpress.com' ],
	};

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	describe( 'Basic Rendering', () => {
		it( 'renders form with nameserver fields', () => {
			render( <NameServersForm { ...defaultProps } /> );

			// Labels include "(Required)" suffix, so use partial matching
			expect( screen.getByText( /Name server 1/ ) ).toBeVisible();
			expect( screen.getByText( /Name server 2/ ) ).toBeVisible();
		} );

		it( 'renders toggle for "Use WordPress.com name servers"', () => {
			render( <NameServersForm { ...defaultProps } /> );

			expect( screen.getByText( 'Use WordPress.com name servers' ) ).toBeVisible();
		} );

		it( 'renders save button', () => {
			render( <NameServersForm { ...defaultProps } /> );

			expect( screen.getByRole( 'button', { name: 'Save' } ) ).toBeVisible();
		} );
	} );

	describe( 'Toggle Behavior', () => {
		it( 'populates default nameservers when toggle is enabled', async () => {
			const user = userEvent.setup();

			render( <NameServersForm { ...defaultProps } /> );

			const toggle = screen.getByRole( 'checkbox', { name: 'Use WordPress.com name servers' } );
			await user.click( toggle );

			await waitFor( () => {
				expect( screen.getByDisplayValue( 'ns1.wordpress.com' ) ).toBeVisible();
				expect( screen.getByDisplayValue( 'ns2.wordpress.com' ) ).toBeVisible();
				expect( screen.getByDisplayValue( 'ns3.wordpress.com' ) ).toBeVisible();
			} );
		} );

		it( 'clears nameservers when toggle is disabled', async () => {
			const user = userEvent.setup();

			render(
				<NameServersForm
					{ ...defaultProps }
					isUsingDefaultNameServers
					nameServers={ [ 'ns1.wordpress.com', 'ns2.wordpress.com', 'ns3.wordpress.com' ] }
				/>
			);

			const toggle = screen.getByRole( 'checkbox', { name: 'Use WordPress.com name servers' } );
			await user.click( toggle );

			await waitFor( () => {
				expect( screen.queryByDisplayValue( 'ns1.wordpress.com' ) ).not.toBeInTheDocument();
			} );
		} );
	} );

	describe( 'Validation', () => {
		it( 'accepts valid hostnames without showing errors', async () => {
			const user = userEvent.setup();

			render( <NameServersForm { ...defaultProps } /> );

			const input1 = screen.getByRole( 'textbox', { name: /Name server 1/ } );
			const input2 = screen.getByRole( 'textbox', { name: /Name server 2/ } );

			await user.type( input1, 'ns1.example.com' );
			await user.type( input2, 'ns2.example.com' );

			// Valid hostnames should enable the submit button
			await waitFor( () => {
				const submitButton = screen.getByRole( 'button', { name: 'Save' } );
				expect( submitButton ).not.toBeDisabled();
			} );
		} );
	} );

	describe( 'Submit Button State', () => {
		it( 'disables submit button when form is empty', () => {
			render( <NameServersForm { ...defaultProps } /> );

			const submitButton = screen.getByRole( 'button', { name: 'Save' } );
			expect( submitButton ).toBeDisabled();
		} );

		it( 'disables submit button when isBusy is true', () => {
			render(
				<NameServersForm
					{ ...defaultProps }
					isBusy
					nameServers={ [ 'ns1.example.com', 'ns2.example.com' ] }
				/>
			);

			const submitButton = screen.getByRole( 'button', { name: 'Save' } );
			expect( submitButton ).toBeDisabled();
		} );

		it( 'disables submit button when form is unchanged', () => {
			render(
				<NameServersForm
					{ ...defaultProps }
					nameServers={ [ 'ns1.example.com', 'ns2.example.com' ] }
				/>
			);

			const submitButton = screen.getByRole( 'button', { name: 'Save' } );
			expect( submitButton ).toBeDisabled();
		} );

		it( 'enables submit button when form has valid changes', async () => {
			const user = userEvent.setup();

			render( <NameServersForm { ...defaultProps } /> );

			const input1 = screen.getByRole( 'textbox', { name: /Name server 1/ } );
			const input2 = screen.getByRole( 'textbox', { name: /Name server 2/ } );

			await user.type( input1, 'ns1.example.com' );
			await user.type( input2, 'ns2.example.com' );

			await waitFor( () => {
				const submitButton = screen.getByRole( 'button', { name: 'Save' } );
				expect( submitButton ).not.toBeDisabled();
			} );
		} );
	} );

	describe( 'Additional Nameserver Fields', () => {
		it( 'shows additional nameserver fields only when previous field has value', async () => {
			const user = userEvent.setup();

			render( <NameServersForm { ...defaultProps } /> );

			// Initially, field 3 should not be visible
			expect( screen.queryByText( 'Name server 3' ) ).not.toBeInTheDocument();

			// Fill in first two fields
			const input1 = screen.getByRole( 'textbox', { name: /Name server 1/ } );
			const input2 = screen.getByRole( 'textbox', { name: /Name server 2/ } );

			await user.type( input1, 'ns1.example.com' );
			await user.type( input2, 'ns2.example.com' );

			// Field 3 should now be visible
			await waitFor( () => {
				expect( screen.getByText( 'Name server 3' ) ).toBeVisible();
			} );
		} );

		it( 'shows field 4 only when field 3 has value', async () => {
			const user = userEvent.setup();

			render(
				<NameServersForm
					{ ...defaultProps }
					nameServers={ [ 'ns1.example.com', 'ns2.example.com' ] }
				/>
			);

			// Initially, field 4 should not be visible
			expect( screen.queryByText( 'Name server 4' ) ).not.toBeInTheDocument();

			// Fill in field 3
			const input3 = screen.getByRole( 'textbox', { name: /Name server 3/ } );
			await user.type( input3, 'ns3.example.com' );

			// Field 4 should now be visible
			await waitFor( () => {
				expect( screen.getByText( 'Name server 4' ) ).toBeVisible();
			} );
		} );
	} );

	describe( 'Read-only Fields', () => {
		it( 'shows read-only nameserver fields when using WPCOM nameservers', () => {
			render(
				<NameServersForm
					{ ...defaultProps }
					isUsingDefaultNameServers
					nameServers={ [ 'ns1.wordpress.com', 'ns2.wordpress.com', 'ns3.wordpress.com' ] }
				/>
			);

			// Fields should be disabled when using WPCOM nameservers
			const inputs = screen.getAllByRole( 'textbox' );
			inputs.forEach( ( input ) => {
				expect( input ).toBeDisabled();
			} );
		} );

		it( 'shows editable nameserver fields when using custom nameservers', () => {
			render(
				<NameServersForm
					{ ...defaultProps }
					isUsingDefaultNameServers={ false }
					nameServers={ [ 'ns1.custom.com', 'ns2.custom.com' ] }
				/>
			);

			const input1 = screen.getByRole( 'textbox', { name: /Name server 1/ } );
			const input2 = screen.getByRole( 'textbox', { name: /Name server 2/ } );

			expect( input1 ).not.toBeDisabled();
			expect( input2 ).not.toBeDisabled();
		} );
	} );

	describe( 'Form Submission', () => {
		it( 'calls onSubmit with correct data when form is submitted', async () => {
			const user = userEvent.setup();
			const mockOnSubmit = jest.fn();

			render( <NameServersForm { ...defaultProps } onSubmit={ mockOnSubmit } /> );

			const input1 = screen.getByRole( 'textbox', { name: /Name server 1/ } );
			const input2 = screen.getByRole( 'textbox', { name: /Name server 2/ } );

			await user.type( input1, 'ns1.example.com' );
			await user.type( input2, 'ns2.example.com' );

			await waitFor( () => {
				const submitButton = screen.getByRole( 'button', { name: 'Save' } );
				expect( submitButton ).not.toBeDisabled();
			} );

			const submitButton = screen.getByRole( 'button', { name: 'Save' } );
			await user.click( submitButton );

			expect( mockOnSubmit ).toHaveBeenCalledWith( [ 'ns1.example.com', 'ns2.example.com' ] );
		} );

		it( 'calls onSubmit with WPCOM nameservers when toggle is enabled', async () => {
			const user = userEvent.setup();
			const mockOnSubmit = jest.fn();

			render( <NameServersForm { ...defaultProps } onSubmit={ mockOnSubmit } /> );

			const toggle = screen.getByRole( 'checkbox', { name: 'Use WordPress.com name servers' } );
			await user.click( toggle );

			await waitFor( () => {
				const submitButton = screen.getByRole( 'button', { name: 'Save' } );
				expect( submitButton ).not.toBeDisabled();
			} );

			const submitButton = screen.getByRole( 'button', { name: 'Save' } );
			await user.click( submitButton );

			expect( mockOnSubmit ).toHaveBeenCalledWith( [
				'ns1.wordpress.com',
				'ns2.wordpress.com',
				'ns3.wordpress.com',
			] );
		} );
	} );

	describe( 'Support Link', () => {
		it( 'shows support link when using custom nameservers', async () => {
			render( <NameServersForm { ...defaultProps } isUsingDefaultNameServers={ false } /> );

			// The support link should be visible when not using WPCOM nameservers
			expect( screen.getByText( 'Look up' ) ).toBeVisible();
			expect( screen.getByText( 'Look up' ) ).toHaveAttribute(
				'data-support-context',
				'change-name-servers-finding-out-new-ns'
			);
		} );
	} );
} );
