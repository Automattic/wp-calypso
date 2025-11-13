/**
 * @jest-environment jsdom
 */
import {
	Domain,
	DomainConnectionSetupMode,
	DomainMappingSetupInfo,
	DomainMappingStatus,
	DomainStatus,
	DomainSubtype,
} from '@automattic/api-core';
import { screen } from '@testing-library/react';
import { render } from '../../../test-utils';
import DomainConnectionVerification from '../domain-connection-verification';

// Mock InlineSupportLink to render a button with the support context as data attribute
jest.mock( '../../../components/inline-support-link', () => ( {
	__esModule: true,
	default: ( {
		children,
		supportContext,
	}: {
		children: React.ReactNode;
		supportContext: string;
	} ) => <button data-support-context={ supportContext }>{ children }</button>,
} ) );

// Mock RouterLinkSummaryButton to avoid routing issues
jest.mock( '../../../components/router-link-summary-button', () => ( {
	__esModule: true,
	default: ( { title }: { title: string } ) => <div>{ title }</div>,
} ) );

// Mock DomainPropagationStatus to avoid useAuth dependency
jest.mock( '../components/domain-propagation-status', () => ( {
	__esModule: true,
	default: () => null,
} ) );

const createMockDomain = (): Domain => ( {
	// DomainSummary properties
	blog_id: 123,
	domain: 'example.com',
	subtype: {
		id: DomainSubtype.DOMAIN_CONNECTION,
		label: 'Domain Connection',
	},
	blog_name: 'Example Blog',
	site_slug: 'example.wordpress.com',
	auto_renewing: false,
	current_user_is_owner: true,
	is_domain_only_site: false,
	expiry: null,
	expired: false,
	primary_domain: false,
	can_set_as_primary: true,
	domain_status: {
		id: DomainStatus.ACTIVE,
		label: 'Active',
		type: 'success',
	},
	subscription_id: null,
	tags: [],

	// Domain-specific properties
	auth_code_required: false,
	aftermarket_auction: false,
	auto_renewal_date: '',
	can_manage_name_servers: true,
	can_manage_dns_records: true,
	can_update_contact_info: true,
	can_transfer_to_any_user: true,
	can_transfer_to_other_site: true,
	cannot_manage_name_servers_reason: null,
	cannot_manage_dns_records_reason: null,
	cannot_update_contact_info_reason: null,
	current_user_can_manage: true,
	contact_info_disclosure_available: false,
	contact_info_disclosed: false,
	current_user_cannot_add_email_reason: null,
	domain_locking_available: false,
	has_wpcom_nameservers: false,
	is_dnssec_enabled: false,
	is_dnssec_supported: false,
	is_eligible_for_inbound_transfer: false,
	is_gravatar_domain: false,
	is_gravatar_restricted_domain: false,
	is_locked: false,
	is_pending_whois_update: false,
	is_root_domain_registered_with_automattic: false,
	is_redeemable: false,
	is_hundred_year_domain: false,
	is_subdomain: false,
	is_pending_icann_verification: false,
	is_wpcom_staging_domain: false,
	move_to_new_site_pending: false,
	nominet_pending_contact_verification_request: false,
	nominet_domain_suspended: false,
	owner: 'user',
	is_pending_registration: false,
	is_pending_registration_at_registry: false,
	private_domain: false,
	privacy_available: false,
	points_to_wpcom: false,
	pending_registration: false,
	pending_registration_at_registry: false,
	pending_transfer: false,
	renewable_until: '',
	ssl_status: 'inactive',
	subdomain_part: '',
	transfer_status: null,
	transfer_away_eligible_at: '',
	type: 'mapping',
	wpcom_domain: false,
	registration_date: '',
	last_transfer_error: '',
	current_user_can_add_email: true,
} );

const createMockDomainMappingStatus = (
	overrides?: Partial< DomainMappingStatus >
): DomainMappingStatus => ( {
	has_mapping_records: true,
	has_wpcom_nameservers: false,
	has_wpcom_ip_addresses: true,
	has_cloudflare_ip_addresses: false,
	has_mx_records: false,
	www_cname_record_target: 'example.com',
	resolves_to_wpcom: true,
	host_ip_addresses: [ '192.0.2.1' ],
	name_servers: [],
	mode: DomainConnectionSetupMode.ADVANCED,
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
	registrar_url: null,
	registrar: null,
	registrar_iana_id: null,
	reseller: null,
	...overrides,
} );

describe( 'DomainConnectionVerification', () => {
	const defaultProps = {
		domainData: createMockDomain(),
		domainName: 'example.com',
		siteSlug: 'example.wordpress.com',
		domainMappingStatus: createMockDomainMappingStatus(),
		domainConnectionSetupInfo: createMockDomainConnectionSetupInfo(),
	};

	describe( 'Basic Rendering', () => {
		test( 'renders the verification component with domain name', () => {
			const { container } = render( <DomainConnectionVerification { ...defaultProps } /> );

			const titleElement = container.querySelector(
				'.dashboard-domain-connection-verification__title'
			);
			expect( titleElement ).toHaveTextContent( 'example.com' );
		} );

		test( 'shows Active badge when domain is connected', () => {
			const domainMappingStatus = createMockDomainMappingStatus( {
				has_wpcom_ip_addresses: true,
				resolves_to_wpcom: true,
			} );

			render(
				<DomainConnectionVerification
					{ ...defaultProps }
					domainMappingStatus={ domainMappingStatus }
				/>
			);

			expect( screen.getByText( 'Active' ) ).toBeVisible();
		} );

		test( 'shows Verifying badge when domain is not fully connected', () => {
			const domainMappingStatus = createMockDomainMappingStatus( {
				has_wpcom_ip_addresses: false,
				resolves_to_wpcom: false,
			} );

			render(
				<DomainConnectionVerification
					{ ...defaultProps }
					domainMappingStatus={ domainMappingStatus }
				/>
			);

			const badgeElements = screen.getAllByText( 'Verifying' );
			expect( badgeElements.length ).toBeGreaterThan( 0 );
			expect( badgeElements[ 0 ] ).toBeVisible();
		} );
	} );

	describe( 'Help Section', () => {
		test( 'renders help section with all support links', () => {
			render( <DomainConnectionVerification { ...defaultProps } /> );

			expect( screen.getByText( 'Need help?' ) ).toBeVisible();

			// Check all three support links are present
			expect( screen.getByText( 'Domain connection guide' ) ).toBeVisible();
			expect( screen.getByText( 'Contact support' ) ).toBeVisible();
			expect( screen.getByText( 'Registrar instructions' ) ).toBeVisible();
		} );

		test( 'renders registrar instructions support link with correct support context', () => {
			render( <DomainConnectionVerification { ...defaultProps } /> );

			const registrarInstructionsLink = screen.getByText( 'Registrar instructions' );
			expect( registrarInstructionsLink ).toBeVisible();

			// Verify it has the correct support context
			expect( registrarInstructionsLink ).toHaveAttribute(
				'data-support-context',
				'transfer-domain-registrar-login'
			);
		} );

		test( 'renders domain connection guide link with correct support context', () => {
			render( <DomainConnectionVerification { ...defaultProps } /> );

			const domainConnectionGuideLink = screen.getByText( 'Domain connection guide' );
			expect( domainConnectionGuideLink ).toBeVisible();
			expect( domainConnectionGuideLink ).toHaveAttribute(
				'data-support-context',
				'map-domain-setup-instructions'
			);
		} );

		test( 'renders contact support link with correct support context', () => {
			render( <DomainConnectionVerification { ...defaultProps } /> );

			const contactSupportLink = screen.getByText( 'Contact support' );
			expect( contactSupportLink ).toBeVisible();
			expect( contactSupportLink ).toHaveAttribute(
				'data-support-context',
				'general-support-options'
			);
		} );
	} );

	describe( 'Verification Status', () => {
		test( 'displays info notice when domain is verifying', () => {
			const domainMappingStatus = createMockDomainMappingStatus( {
				has_wpcom_ip_addresses: false,
				resolves_to_wpcom: false,
			} );

			const { container } = render(
				<DomainConnectionVerification
					{ ...defaultProps }
					domainMappingStatus={ domainMappingStatus }
				/>
			);

			const noticeElement = container.querySelector( '.dashboard-notice.is-info' );
			expect( noticeElement ).toBeInTheDocument();
			expect( noticeElement?.textContent ).toContain( 'checking your DNS records' );
		} );

		test( 'does not display info notice when domain is connected', () => {
			const domainMappingStatus = createMockDomainMappingStatus( {
				has_wpcom_ip_addresses: true,
				resolves_to_wpcom: true,
			} );

			render(
				<DomainConnectionVerification
					{ ...defaultProps }
					domainMappingStatus={ domainMappingStatus }
				/>
			);

			expect(
				screen.queryByText(
					/We're checking your DNS records. Most updates happen quickly, but some providers cache old settings for up to 72 hours./
				)
			).not.toBeInTheDocument();
		} );

		test( 'displays correct verification section title for Advanced mode', () => {
			const domainMappingStatus = createMockDomainMappingStatus( {
				mode: DomainConnectionSetupMode.ADVANCED,
			} );

			render(
				<DomainConnectionVerification
					{ ...defaultProps }
					domainMappingStatus={ domainMappingStatus }
				/>
			);

			expect( screen.getByText( 'DNS record verification' ) ).toBeVisible();
		} );

		test( 'displays correct verification section title for Suggested mode', () => {
			const domainMappingStatus = createMockDomainMappingStatus( {
				mode: DomainConnectionSetupMode.SUGGESTED,
			} );

			render(
				<DomainConnectionVerification
					{ ...defaultProps }
					domainMappingStatus={ domainMappingStatus }
				/>
			);

			expect( screen.getByText( 'Name server verification' ) ).toBeVisible();
		} );
	} );

	describe( 'While You Wait Section', () => {
		test( 'displays "While you wait" section when domain is verifying', () => {
			const domainMappingStatus = createMockDomainMappingStatus( {
				has_wpcom_ip_addresses: false,
				resolves_to_wpcom: false,
			} );

			render(
				<DomainConnectionVerification
					{ ...defaultProps }
					domainMappingStatus={ domainMappingStatus }
				/>
			);

			expect( screen.getByText( 'While you wait' ) ).toBeVisible();
			expect( screen.getByText( 'Customize your site' ) ).toBeVisible();
		} );

		test( 'does not display "While you wait" heading when domain is connected', () => {
			const domainMappingStatus = createMockDomainMappingStatus( {
				has_wpcom_ip_addresses: true,
				resolves_to_wpcom: true,
			} );

			render(
				<DomainConnectionVerification
					{ ...defaultProps }
					domainMappingStatus={ domainMappingStatus }
				/>
			);

			expect( screen.queryByText( 'While you wait' ) ).not.toBeInTheDocument();
		} );
	} );
} );
