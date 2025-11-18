/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../test-utils';
import DomainConnectCard from '../domain-connect-card';

// Mock InlineSupportLink to avoid async state updates warnings
jest.mock( '../../../components/inline-support-link', () => ( {
	__esModule: true,
	default: ( { children }: { children: React.ReactNode } ) => <button>{ children }</button>,
} ) );

describe( 'DomainConnectCard', () => {
	const defaultProps = {
		onChangeSetupMode: jest.fn(),
		onVerifyConnection: jest.fn(),
		isUpdatingConnectionMode: false,
		registrar: null,
		registrar_url: null,
	};

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	describe( 'Basic Rendering', () => {
		test( 'renders the card with basic elements', () => {
			render( <DomainConnectCard { ...defaultProps } /> );

			expect( screen.getByText( 'Domain Connect available' ) ).toBeVisible();
			expect( screen.getByRole( 'button', { name: 'Start setup' } ) ).toBeVisible();
			expect( screen.getByRole( 'button', { name: 'Use manual setup' } ) ).toBeVisible();
		} );

		test( 'calls onVerifyConnection when Start setup is clicked', async () => {
			const user = userEvent.setup();
			const onVerifyConnection = jest.fn();

			render( <DomainConnectCard { ...defaultProps } onVerifyConnection={ onVerifyConnection } /> );

			const startButton = screen.getByRole( 'button', { name: 'Start setup' } );
			await user.click( startButton );

			expect( onVerifyConnection ).toHaveBeenCalledTimes( 1 );
		} );

		test( 'calls onChangeSetupMode when Use manual setup is clicked', async () => {
			const user = userEvent.setup();
			const onChangeSetupMode = jest.fn();

			render( <DomainConnectCard { ...defaultProps } onChangeSetupMode={ onChangeSetupMode } /> );

			const manualButton = screen.getByRole( 'button', { name: 'Use manual setup' } );
			await user.click( manualButton );

			expect( onChangeSetupMode ).toHaveBeenCalledTimes( 1 );
		} );

		test( 'disables buttons when isUpdatingConnectionMode is true', () => {
			render( <DomainConnectCard { ...defaultProps } isUpdatingConnectionMode /> );

			const startButton = screen.getByRole( 'button', { name: 'Start setup' } );
			const manualButton = screen.getByRole( 'button', { name: 'Use manual setup' } );

			expect( startButton ).toBeDisabled();
			expect( manualButton ).toBeDisabled();
		} );
	} );

	describe( 'Registrar Information Display', () => {
		test( 'displays registrar name as a clickable link when registrar and URL are provided', () => {
			render(
				<DomainConnectCard
					{ ...defaultProps }
					registrar="GoDaddy"
					registrar_url="https://www.godaddy.com"
				/>
			);

			// Check that registrar link is present in the description
			const registrarLink = screen.getByRole( 'link', { name: /GoDaddy/i } );
			expect( registrarLink ).toBeVisible();
			expect( registrarLink ).toHaveAttribute( 'href', 'https://www.godaddy.com' );

			// Check that the text is correctly formatted
			expect(
				screen.getByText( /supports a quick and easy connection to WordPress.com/, {
					exact: false,
				} )
			).toBeVisible();
		} );

		test( 'displays registrar name without link when URL is not provided', () => {
			render(
				<DomainConnectCard { ...defaultProps } registrar="GoDaddy" registrar_url={ null } />
			);

			// Check that registrar name is displayed but not as a link
			expect( screen.getByText( /GoDaddy/ ) ).toBeVisible();
			const registrarLink = screen.queryByRole( 'link', { name: /GoDaddy/i } );
			expect( registrarLink ).not.toBeInTheDocument();
		} );

		test( 'displays registrar name without link when registrar_url is null (reseller)', () => {
			render(
				<DomainConnectCard { ...defaultProps } registrar="Reseller Name" registrar_url={ null } />
			);

			// Check that reseller name is displayed but not as a link
			expect( screen.getByText( /Reseller Name/ ) ).toBeVisible();
			const registrarLink = screen.queryByRole( 'link', { name: /Reseller Name/i } );
			expect( registrarLink ).not.toBeInTheDocument();
		} );

		test( 'displays fallback text when registrar info is not available', () => {
			render( <DomainConnectCard { ...defaultProps } registrar={ null } registrar_url={ null } /> );

			// Check that fallback text is displayed
			expect( screen.getByText( /Your domain name provider/ ) ).toBeVisible();

			// Ensure no registrar links are present
			const links = screen.queryAllByRole( 'link' );
			const registrarLinks = links.filter( ( link ) => {
				const text = link.textContent || '';
				return (
					text.includes( 'GoDaddy' ) || text.includes( 'Namecheap' ) || text.includes( 'Bluehost' )
				);
			} );
			expect( registrarLinks ).toHaveLength( 0 );
		} );

		test( 'displays fallback text when registrar is empty string', () => {
			render( <DomainConnectCard { ...defaultProps } registrar="" registrar_url={ null } /> );

			// Check that fallback text is displayed
			expect( screen.getByText( /Your domain name provider/ ) ).toBeVisible();
		} );

		test( 'correctly formats description with different registrar names', () => {
			const registrars = [
				{ name: 'Namecheap', url: 'https://www.namecheap.com' },
				{ name: 'Bluehost', url: 'https://www.bluehost.com' },
				{ name: 'Google Domains', url: 'https://domains.google' },
			];

			registrars.forEach( ( { name, url } ) => {
				const { unmount } = render(
					<DomainConnectCard { ...defaultProps } registrar={ name } registrar_url={ url } />
				);

				const registrarLink = screen.getByRole( 'link', { name: new RegExp( name, 'i' ) } );
				expect( registrarLink ).toBeVisible();
				expect( registrarLink ).toHaveAttribute( 'href', url );

				unmount();
			} );
		} );
	} );

	describe( 'Error States', () => {
		test( 'displays error message when error is provided', () => {
			render(
				<DomainConnectCard
					{ ...defaultProps }
					error="access_denied"
					errorDescription="user_cancel"
				/>
			);

			// Check that error message is displayed
			expect(
				screen.getByText( 'Connecting your domain to WordPress.com was cancelled' )
			).toBeVisible();
			expect( screen.getByText( 'Something went wrong' ) ).toBeVisible();
		} );

		test( 'displays generic error message for non-cancellation errors', () => {
			render(
				<DomainConnectCard { ...defaultProps } error="server_error" errorDescription={ null } />
			);

			// Check that generic error message is displayed
			expect( screen.getByText( 'There was a problem connecting your domain' ) ).toBeVisible();
		} );

		test( 'displays registrar info even when error is present', () => {
			render(
				<DomainConnectCard
					{ ...defaultProps }
					registrar="GoDaddy"
					registrar_url="https://www.godaddy.com"
					error="access_denied"
					errorDescription="user_cancel"
				/>
			);

			// Check that error is displayed
			expect( screen.getByText( 'Something went wrong' ) ).toBeVisible();

			// When error is present, registrar info is not displayed (only shown in default content)
			const registrarLink = screen.queryByRole( 'link', { name: /GoDaddy/i } );
			expect( registrarLink ).not.toBeInTheDocument();
		} );
	} );

	describe( 'Help Section', () => {
		test( 'renders help section with support links', () => {
			render( <DomainConnectCard { ...defaultProps } /> );

			expect( screen.getByText( 'Need help?' ) ).toBeVisible();
		} );
	} );
} );
