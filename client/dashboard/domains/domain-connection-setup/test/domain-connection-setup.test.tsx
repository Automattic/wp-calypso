/**
 * @jest-environment jsdom
 */
import {
	DomainConnectionSetupMode,
	DomainMappingSetupInfo,
	DomainMappingStatus,
} from '@automattic/api-core';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../test-utils';
import DomainConnectionSetup from '../domain-connection-setup';

// Mock InlineSupportLink to avoid async state update warnings
jest.mock( '../../../components/inline-support-link', () => ( {
	__esModule: true,
	default: ( { children }: { children: React.ReactNode } ) => <button>{ children }</button>,
} ) );

const createMockDomainMappingStatus = (
	overrides?: Partial< DomainMappingStatus >
): DomainMappingStatus => ( {
	has_mapping_records: false,
	has_wpcom_nameservers: false,
	has_wpcom_ip_addresses: false,
	has_cloudflare_ip_addresses: false,
	has_mx_records: false,
	www_cname_record_target: null,
	resolves_to_wpcom: false,
	host_ip_addresses: [],
	name_servers: [],
	mode: null,
	...overrides,
} );

const createMockDomainConnectionSetupInfo = (
	overrides?: Partial< DomainMappingSetupInfo >
): DomainMappingSetupInfo => ( {
	connection_mode: null,
	domain_connect_apply_wpcom_hosting: null,
	domain_connect_provider_id: null,
	default_ip_addresses: [ '192.0.2.1' ],
	wpcom_name_servers: [ 'ns1.wordpress.com', 'ns2.wordpress.com', 'ns3.wordpress.com' ],
	is_subdomain: false,
	root_domain: 'example.com',
	...overrides,
} );

describe( 'DomainConnectionSetup', () => {
	const defaultProps = {
		domainName: 'example.com',
		siteSlug: 'example.wordpress.com',
		onVerifyConnection: jest.fn(),
		isUpdatingConnectionMode: false,
	};

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	describe( 'Domain Connect Available', () => {
		test( 'renders Domain Connect card by default when DC is available and mode is null', () => {
			const domainMappingStatus = createMockDomainMappingStatus( { mode: null } );
			const domainConnectionSetupInfo = createMockDomainConnectionSetupInfo( {
				domain_connect_apply_wpcom_hosting: 'https://example.com/domain-connect',
				domain_connect_provider_id: 'godaddy',
			} );

			render(
				<DomainConnectionSetup
					{ ...defaultProps }
					domainMappingStatus={ domainMappingStatus }
					domainConnectionSetupInfo={ domainConnectionSetupInfo }
				/>
			);

			// Should show Domain Connect card
			expect( screen.getByText( 'Domain Connect available' ) ).toBeVisible();
			expect( screen.getByRole( 'button', { name: 'Start setup' } ) ).toBeVisible();
			expect( screen.getByRole( 'button', { name: 'Use manual setup' } ) ).toBeVisible();
		} );

		test( 'renders error message when error query params are present', () => {
			const domainMappingStatus = createMockDomainMappingStatus( { mode: null } );
			const domainConnectionSetupInfo = createMockDomainConnectionSetupInfo( {
				domain_connect_apply_wpcom_hosting: 'https://example.com/domain-connect',
			} );

			render(
				<DomainConnectionSetup
					{ ...defaultProps }
					domainMappingStatus={ domainMappingStatus }
					domainConnectionSetupInfo={ domainConnectionSetupInfo }
					queryError="access_denied"
					queryErrorDescription="user_cancel"
				/>
			);

			// Should show error message
			expect(
				screen.getByText( 'Connecting your domain to WordPress.com was cancelled' )
			).toBeVisible();
			expect( screen.getByText( 'Something went wrong' ) ).toBeVisible();
			expect(
				screen.getByText( /There was a problem completing your Domain Connect setup/ )
			).toBeVisible();
		} );

		test( 'renders generic error message for non-cancellation errors', () => {
			const domainMappingStatus = createMockDomainMappingStatus( { mode: null } );
			const domainConnectionSetupInfo = createMockDomainConnectionSetupInfo( {
				domain_connect_apply_wpcom_hosting: 'https://example.com/domain-connect',
			} );

			render(
				<DomainConnectionSetup
					{ ...defaultProps }
					domainMappingStatus={ domainMappingStatus }
					domainConnectionSetupInfo={ domainConnectionSetupInfo }
					queryError="server_error"
					queryErrorDescription="internal_error"
				/>
			);

			// Should show generic error message
			expect( screen.getByText( 'There was a problem connecting your domain' ) ).toBeVisible();
		} );

		test( 'switches to manual setup when "Use manual setup" is clicked', async () => {
			const user = userEvent.setup();
			const domainMappingStatus = createMockDomainMappingStatus( { mode: null } );
			const domainConnectionSetupInfo = createMockDomainConnectionSetupInfo( {
				domain_connect_apply_wpcom_hosting: 'https://example.com/domain-connect',
			} );

			render(
				<DomainConnectionSetup
					{ ...defaultProps }
					domainMappingStatus={ domainMappingStatus }
					domainConnectionSetupInfo={ domainConnectionSetupInfo }
				/>
			);

			// Click "Use manual setup" button
			const manualSetupButton = screen.getByRole( 'button', { name: 'Use manual setup' } );
			await user.click( manualSetupButton );

			// Should now show manual setup cards
			expect( screen.getByText( 'I only use this domain name for my website' ) ).toBeVisible();
			expect(
				screen.getByText( 'I use this domain name for email or other services' )
			).toBeVisible();

			// Should show banner to switch back to DC
			expect(
				screen.getByText( 'This domain name can be automatically connected.' )
			).toBeVisible();
			expect( screen.getByRole( 'button', { name: 'Use domain connect' } ) ).toBeVisible();
		} );

		test( 'calls onVerifyConnection with DC mode when "Start setup" is clicked', async () => {
			const user = userEvent.setup();
			const onVerifyConnection = jest.fn();
			const domainMappingStatus = createMockDomainMappingStatus( { mode: null } );
			const domainConnectionSetupInfo = createMockDomainConnectionSetupInfo( {
				domain_connect_apply_wpcom_hosting: 'https://example.com/domain-connect',
			} );

			render(
				<DomainConnectionSetup
					{ ...defaultProps }
					onVerifyConnection={ onVerifyConnection }
					domainMappingStatus={ domainMappingStatus }
					domainConnectionSetupInfo={ domainConnectionSetupInfo }
				/>
			);

			const startSetupButton = screen.getByRole( 'button', { name: 'Start setup' } );
			await user.click( startSetupButton );

			expect( onVerifyConnection ).toHaveBeenCalledWith( DomainConnectionSetupMode.DC );
		} );
	} );

	describe( 'Domain Connect Not Available', () => {
		test( 'renders manual setup cards when DC is not available', () => {
			const domainMappingStatus = createMockDomainMappingStatus( { mode: null } );
			const domainConnectionSetupInfo = createMockDomainConnectionSetupInfo( {
				domain_connect_apply_wpcom_hosting: null,
			} );

			render(
				<DomainConnectionSetup
					{ ...defaultProps }
					domainMappingStatus={ domainMappingStatus }
					domainConnectionSetupInfo={ domainConnectionSetupInfo }
				/>
			);

			// Should show manual setup cards
			expect( screen.getByText( 'I only use this domain name for my website' ) ).toBeVisible();
			expect(
				screen.getByText( 'I use this domain name for email or other services' )
			).toBeVisible();

			// Should NOT show Domain Connect card or banner
			expect( screen.queryByText( 'Domain Connect available' ) ).not.toBeInTheDocument();
			expect(
				screen.queryByText( 'This domain name can be automatically connected.' )
			).not.toBeInTheDocument();
		} );

		test( 'defaults to suggested mode when no MX records detected', () => {
			const domainMappingStatus = createMockDomainMappingStatus( {
				mode: null,
				has_mx_records: false,
			} );
			const domainConnectionSetupInfo = createMockDomainConnectionSetupInfo( {
				domain_connect_apply_wpcom_hosting: null,
			} );

			render(
				<DomainConnectionSetup
					{ ...defaultProps }
					domainMappingStatus={ domainMappingStatus }
					domainConnectionSetupInfo={ domainConnectionSetupInfo }
				/>
			);

			// Suggested mode card should be expanded (shows steps)
			expect( screen.getByText( '1. Login to your domain name provider' ) ).toBeVisible();
			expect( screen.getByText( '2. Back up DNS records' ) ).toBeVisible();
			expect( screen.getByText( '3. Update name servers' ) ).toBeVisible();
		} );

		test( 'defaults to advanced mode when MX records detected', () => {
			const domainMappingStatus = createMockDomainMappingStatus( {
				mode: null,
				has_mx_records: true,
			} );
			const domainConnectionSetupInfo = createMockDomainConnectionSetupInfo( {
				domain_connect_apply_wpcom_hosting: null,
			} );

			render(
				<DomainConnectionSetup
					{ ...defaultProps }
					domainMappingStatus={ domainMappingStatus }
					domainConnectionSetupInfo={ domainConnectionSetupInfo }
				/>
			);

			// Advanced mode card should be expanded (shows steps)
			expect( screen.getByText( '1. Login to your domain name provider' ) ).toBeVisible();
			expect( screen.getByText( '2. Back up DNS records' ) ).toBeVisible();
			expect( screen.getByText( '3. Update DNS records' ) ).toBeVisible();
		} );
	} );

	describe( 'Mode Switching', () => {
		test( 'switches from manual to Domain Connect when "Use domain connect" is clicked', async () => {
			const user = userEvent.setup();
			const domainMappingStatus = createMockDomainMappingStatus( {
				mode: null,
				has_mx_records: false,
			} );
			const domainConnectionSetupInfo = createMockDomainConnectionSetupInfo( {
				domain_connect_apply_wpcom_hosting: 'https://example.com/domain-connect',
			} );

			render(
				<DomainConnectionSetup
					{ ...defaultProps }
					domainMappingStatus={ domainMappingStatus }
					domainConnectionSetupInfo={ domainConnectionSetupInfo }
				/>
			);

			// Start at DC card, switch to manual
			const manualSetupButton = screen.getByRole( 'button', { name: 'Use manual setup' } );
			await user.click( manualSetupButton );

			// Verify we're at manual setup
			expect( screen.getByText( 'I only use this domain name for my website' ) ).toBeVisible();

			// Switch back to DC
			const useDomainConnectButton = screen.getByRole( 'button', {
				name: 'Use domain connect',
			} );
			await user.click( useDomainConnectButton );

			// Should be back at Domain Connect card
			expect( screen.getByText( 'Domain Connect available' ) ).toBeVisible();
		} );
	} );

	describe( 'Mode Already Set', () => {
		test( 'shows Domain Connect card when DC is available, even if server mode is set', () => {
			const domainMappingStatus = createMockDomainMappingStatus( {
				mode: DomainConnectionSetupMode.SUGGESTED,
			} );
			const domainConnectionSetupInfo = createMockDomainConnectionSetupInfo( {
				domain_connect_apply_wpcom_hosting: 'https://example.com/domain-connect',
			} );

			render(
				<DomainConnectionSetup
					{ ...defaultProps }
					domainMappingStatus={ domainMappingStatus }
					domainConnectionSetupInfo={ domainConnectionSetupInfo }
				/>
			);

			// Should show DC card because local state initializes to DC when available
			expect( screen.getByText( 'Domain Connect available' ) ).toBeVisible();
			expect( screen.getByRole( 'button', { name: 'Start setup' } ) ).toBeVisible();
		} );
	} );

	describe( 'Help Links', () => {
		test( 'renders help section in Domain Connect card', () => {
			const domainMappingStatus = createMockDomainMappingStatus( { mode: null } );
			const domainConnectionSetupInfo = createMockDomainConnectionSetupInfo( {
				domain_connect_apply_wpcom_hosting: 'https://example.com/domain-connect',
			} );

			render(
				<DomainConnectionSetup
					{ ...defaultProps }
					domainMappingStatus={ domainMappingStatus }
					domainConnectionSetupInfo={ domainConnectionSetupInfo }
				/>
			);

			expect( screen.getByText( 'Need help?' ) ).toBeVisible();
			// InlineSupportLink components are present
			expect( screen.getByRole( 'button', { name: 'Use manual setup' } ) ).toBeVisible();
		} );
	} );

	describe( 'Loading States', () => {
		test( 'disables Start setup button when updating connection mode', () => {
			const domainMappingStatus = createMockDomainMappingStatus( { mode: null } );
			const domainConnectionSetupInfo = createMockDomainConnectionSetupInfo( {
				domain_connect_apply_wpcom_hosting: 'https://example.com/domain-connect',
			} );

			render(
				<DomainConnectionSetup
					{ ...defaultProps }
					domainMappingStatus={ domainMappingStatus }
					domainConnectionSetupInfo={ domainConnectionSetupInfo }
					isUpdatingConnectionMode
				/>
			);

			const startSetupButton = screen.getByRole( 'button', { name: 'Start setup' } );
			expect( startSetupButton ).toBeDisabled();
		} );
	} );
} );
