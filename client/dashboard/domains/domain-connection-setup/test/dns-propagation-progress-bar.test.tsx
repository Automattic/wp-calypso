/**
 * @jest-environment jsdom
 */
import { DomainConnectionSetupMode } from '@automattic/api-core';
import { render } from '../../../test-utils';
import DnsPropagationProgressBar from '../components/dns-propagation-progress-bar';
import type { DomainMappingSetupInfo, DomainMappingStatus } from '@automattic/api-core';

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
	default_ip_addresses: [ '192.0.78.24', '192.0.78.25' ],
	wpcom_name_servers: [ 'ns1.wordpress.com', 'ns2.wordpress.com', 'ns3.wordpress.com' ],
	is_subdomain: false,
	root_domain: 'example.com',
	registrar_url: null,
	registrar: null,
	registrar_iana_id: null,
	reseller: null,
	...overrides,
} );

describe( 'DnsPropagationProgressBar', () => {
	test( 'renders 100% for DC mode when all IP addresses match', () => {
		const domainMappingStatus = createMockDomainMappingStatus( {
			mode: DomainConnectionSetupMode.DC,
			host_ip_addresses: [ '192.0.78.24', '192.0.78.25' ],
		} );
		const domainConnectionSetupInfo = createMockDomainConnectionSetupInfo( {
			default_ip_addresses: [ '192.0.78.24', '192.0.78.25' ],
		} );

		const { getByRole, getByText } = render(
			<DnsPropagationProgressBar
				domainMappingStatus={ domainMappingStatus }
				domainConnectionSetupInfo={ domainConnectionSetupInfo }
			/>
		);

		expect( getByText( 'Progress' ) ).toBeVisible();
		expect( getByText( '100%' ) ).toBeVisible();
		expect( getByRole( 'progressbar' ) ).toHaveAttribute( 'value', '100' );
	} );

	test( 'renders 100% when all name servers match in suggested mode', () => {
		const domainMappingStatus = createMockDomainMappingStatus( {
			mode: DomainConnectionSetupMode.SUGGESTED,
			name_servers: [ 'ns1.wordpress.com', 'ns2.wordpress.com', 'ns3.wordpress.com' ],
		} );
		const domainConnectionSetupInfo = createMockDomainConnectionSetupInfo( {
			wpcom_name_servers: [ 'ns1.wordpress.com', 'ns2.wordpress.com', 'ns3.wordpress.com' ],
		} );

		const { getByRole, getByText } = render(
			<DnsPropagationProgressBar
				domainMappingStatus={ domainMappingStatus }
				domainConnectionSetupInfo={ domainConnectionSetupInfo }
			/>
		);

		expect( getByText( '100%' ) ).toBeVisible();
		expect( getByRole( 'progressbar' ) ).toHaveAttribute( 'value', '100' );
	} );

	test( 'renders 100% when all IP addresses match in advanced mode', () => {
		const domainMappingStatus = createMockDomainMappingStatus( {
			mode: DomainConnectionSetupMode.ADVANCED,
			host_ip_addresses: [ '192.0.78.24', '192.0.78.25' ],
		} );
		const domainConnectionSetupInfo = createMockDomainConnectionSetupInfo( {
			default_ip_addresses: [ '192.0.78.24', '192.0.78.25' ],
		} );

		const { getByRole, getByText } = render(
			<DnsPropagationProgressBar
				domainMappingStatus={ domainMappingStatus }
				domainConnectionSetupInfo={ domainConnectionSetupInfo }
			/>
		);

		expect( getByText( '100%' ) ).toBeVisible();
		expect( getByRole( 'progressbar' ) ).toHaveAttribute( 'value', '100' );
	} );

	test( 'renders 67% when 2 out of 3 name servers match in suggested mode', () => {
		const domainMappingStatus = createMockDomainMappingStatus( {
			mode: DomainConnectionSetupMode.SUGGESTED,
			name_servers: [ 'ns1.wordpress.com', 'ns2.wordpress.com', 'ns1.other.com' ],
		} );
		const domainConnectionSetupInfo = createMockDomainConnectionSetupInfo( {
			wpcom_name_servers: [ 'ns1.wordpress.com', 'ns2.wordpress.com', 'ns3.wordpress.com' ],
		} );

		const { getByRole, getByText } = render(
			<DnsPropagationProgressBar
				domainMappingStatus={ domainMappingStatus }
				domainConnectionSetupInfo={ domainConnectionSetupInfo }
			/>
		);

		expect( getByText( '67%' ) ).toBeVisible();
		expect( getByRole( 'progressbar' ) ).toHaveAttribute( 'value', '67' );
	} );

	test( 'renders 50% when 1 out of 2 IP addresses match in advanced mode', () => {
		const domainMappingStatus = createMockDomainMappingStatus( {
			mode: DomainConnectionSetupMode.ADVANCED,
			host_ip_addresses: [ '192.0.78.24', '185.230.63.186' ],
		} );
		const domainConnectionSetupInfo = createMockDomainConnectionSetupInfo( {
			default_ip_addresses: [ '192.0.78.24', '192.0.78.25' ],
		} );

		const { getByRole, getByText } = render(
			<DnsPropagationProgressBar
				domainMappingStatus={ domainMappingStatus }
				domainConnectionSetupInfo={ domainConnectionSetupInfo }
			/>
		);

		expect( getByText( '50%' ) ).toBeVisible();
		expect( getByRole( 'progressbar' ) ).toHaveAttribute( 'value', '50' );
	} );

	test( 'renders 0% when no IP addresses match in advanced mode', () => {
		const domainMappingStatus = createMockDomainMappingStatus( {
			mode: DomainConnectionSetupMode.ADVANCED,
			host_ip_addresses: [ '185.230.63.186', '185.230.63.187' ],
		} );
		const domainConnectionSetupInfo = createMockDomainConnectionSetupInfo( {
			default_ip_addresses: [ '192.0.78.24', '192.0.78.25' ],
		} );

		const { getByRole, getByText } = render(
			<DnsPropagationProgressBar
				domainMappingStatus={ domainMappingStatus }
				domainConnectionSetupInfo={ domainConnectionSetupInfo }
			/>
		);

		expect( getByText( '0%' ) ).toBeVisible();
		expect( getByRole( 'progressbar' ) ).toHaveAttribute( 'value', '0' );
	} );

	test( 'renders 0% when IP addresses array is empty in advanced mode', () => {
		const domainMappingStatus = createMockDomainMappingStatus( {
			mode: DomainConnectionSetupMode.ADVANCED,
			host_ip_addresses: [],
		} );
		const domainConnectionSetupInfo = createMockDomainConnectionSetupInfo( {
			default_ip_addresses: [ '192.0.78.24', '192.0.78.25' ],
		} );

		const { getByRole, getByText } = render(
			<DnsPropagationProgressBar
				domainMappingStatus={ domainMappingStatus }
				domainConnectionSetupInfo={ domainConnectionSetupInfo }
			/>
		);

		expect( getByText( '0%' ) ).toBeVisible();
		expect( getByRole( 'progressbar' ) ).toHaveAttribute( 'value', '0' );
	} );

	test( 'renders 0% when no name servers match in suggested mode', () => {
		const domainMappingStatus = createMockDomainMappingStatus( {
			mode: DomainConnectionSetupMode.SUGGESTED,
			name_servers: [ 'ns1.other.com', 'ns2.other.com', 'ns3.other.com' ],
		} );
		const domainConnectionSetupInfo = createMockDomainConnectionSetupInfo( {
			wpcom_name_servers: [ 'ns1.wordpress.com', 'ns2.wordpress.com', 'ns3.wordpress.com' ],
		} );

		const { getByRole, getByText } = render(
			<DnsPropagationProgressBar
				domainMappingStatus={ domainMappingStatus }
				domainConnectionSetupInfo={ domainConnectionSetupInfo }
			/>
		);

		expect( getByText( '0%' ) ).toBeVisible();
		expect( getByRole( 'progressbar' ) ).toHaveAttribute( 'value', '0' );
	} );

	test( 'renders 0% when name servers array is empty in suggested mode', () => {
		const domainMappingStatus = createMockDomainMappingStatus( {
			mode: DomainConnectionSetupMode.SUGGESTED,
			name_servers: [],
		} );
		const domainConnectionSetupInfo = createMockDomainConnectionSetupInfo( {
			wpcom_name_servers: [ 'ns1.wordpress.com', 'ns2.wordpress.com', 'ns3.wordpress.com' ],
		} );

		const { getByRole, getByText } = render(
			<DnsPropagationProgressBar
				domainMappingStatus={ domainMappingStatus }
				domainConnectionSetupInfo={ domainConnectionSetupInfo }
			/>
		);

		expect( getByText( '0%' ) ).toBeVisible();
		expect( getByRole( 'progressbar' ) ).toHaveAttribute( 'value', '0' );
	} );

	test( 'renders 0% when expected name servers array is empty in suggested mode', () => {
		const domainMappingStatus = createMockDomainMappingStatus( {
			mode: DomainConnectionSetupMode.SUGGESTED,
			name_servers: [ 'ns1.wordpress.com', 'ns2.wordpress.com' ],
		} );
		const domainConnectionSetupInfo = createMockDomainConnectionSetupInfo( {
			wpcom_name_servers: [],
		} );

		const { getByRole, getByText } = render(
			<DnsPropagationProgressBar
				domainMappingStatus={ domainMappingStatus }
				domainConnectionSetupInfo={ domainConnectionSetupInfo }
			/>
		);

		expect( getByText( '0%' ) ).toBeVisible();
		expect( getByRole( 'progressbar' ) ).toHaveAttribute( 'value', '0' );
	} );

	test( 'handles case-insensitive name server comparison', () => {
		const domainMappingStatus = createMockDomainMappingStatus( {
			mode: DomainConnectionSetupMode.SUGGESTED,
			name_servers: [ 'NS1.WORDPRESS.COM', 'ns2.wordpress.com', 'Ns3.WordPress.Com' ],
		} );
		const domainConnectionSetupInfo = createMockDomainConnectionSetupInfo( {
			wpcom_name_servers: [ 'ns1.wordpress.com', 'ns2.wordpress.com', 'ns3.wordpress.com' ],
		} );

		const { getByRole, getByText } = render(
			<DnsPropagationProgressBar
				domainMappingStatus={ domainMappingStatus }
				domainConnectionSetupInfo={ domainConnectionSetupInfo }
			/>
		);

		expect( getByText( '100%' ) ).toBeVisible();
		expect( getByRole( 'progressbar' ) ).toHaveAttribute( 'value', '100' );
	} );

	test( 'handles extra name servers in current list (only counts matches)', () => {
		const domainMappingStatus = createMockDomainMappingStatus( {
			mode: DomainConnectionSetupMode.SUGGESTED,
			name_servers: [
				'ns1.wordpress.com',
				'ns2.wordpress.com',
				'ns3.wordpress.com',
				'ns4.other.com',
				'ns5.other.com',
			],
		} );
		const domainConnectionSetupInfo = createMockDomainConnectionSetupInfo( {
			wpcom_name_servers: [ 'ns1.wordpress.com', 'ns2.wordpress.com', 'ns3.wordpress.com' ],
		} );

		const { getByRole, getByText } = render(
			<DnsPropagationProgressBar
				domainMappingStatus={ domainMappingStatus }
				domainConnectionSetupInfo={ domainConnectionSetupInfo }
			/>
		);

		expect( getByText( '100%' ) ).toBeVisible();
		expect( getByRole( 'progressbar' ) ).toHaveAttribute( 'value', '100' );
	} );

	test( 'handles extra IP addresses in current list for advanced mode (only counts matches)', () => {
		const domainMappingStatus = createMockDomainMappingStatus( {
			mode: DomainConnectionSetupMode.ADVANCED,
			host_ip_addresses: [ '192.0.78.24', '192.0.78.25', '185.230.63.186', '185.230.63.187' ],
		} );
		const domainConnectionSetupInfo = createMockDomainConnectionSetupInfo( {
			default_ip_addresses: [ '192.0.78.24', '192.0.78.25' ],
		} );

		const { getByRole, getByText } = render(
			<DnsPropagationProgressBar
				domainMappingStatus={ domainMappingStatus }
				domainConnectionSetupInfo={ domainConnectionSetupInfo }
			/>
		);

		expect( getByText( '100%' ) ).toBeVisible();
		expect( getByRole( 'progressbar' ) ).toHaveAttribute( 'value', '100' );
	} );

	test( 'rounds progress percentage correctly (66.67% becomes 67%)', () => {
		const domainMappingStatus = createMockDomainMappingStatus( {
			mode: DomainConnectionSetupMode.SUGGESTED,
			name_servers: [ 'ns1.wordpress.com', 'ns2.wordpress.com' ],
		} );
		const domainConnectionSetupInfo = createMockDomainConnectionSetupInfo( {
			wpcom_name_servers: [ 'ns1.wordpress.com', 'ns2.wordpress.com', 'ns3.wordpress.com' ],
		} );

		const { getByRole, getByText } = render(
			<DnsPropagationProgressBar
				domainMappingStatus={ domainMappingStatus }
				domainConnectionSetupInfo={ domainConnectionSetupInfo }
			/>
		);

		expect( getByText( '67%' ) ).toBeVisible();
		expect( getByRole( 'progressbar' ) ).toHaveAttribute( 'value', '67' );
	} );

	test( 'renders 0% for other connection modes', () => {
		const domainMappingStatus = createMockDomainMappingStatus( {
			mode: DomainConnectionSetupMode.DONE,
			name_servers: [ 'ns1.wordpress.com', 'ns2.wordpress.com', 'ns3.wordpress.com' ],
		} );
		const domainConnectionSetupInfo = createMockDomainConnectionSetupInfo( {
			wpcom_name_servers: [ 'ns1.wordpress.com', 'ns2.wordpress.com', 'ns3.wordpress.com' ],
		} );

		const { getByRole, getByText } = render(
			<DnsPropagationProgressBar
				domainMappingStatus={ domainMappingStatus }
				domainConnectionSetupInfo={ domainConnectionSetupInfo }
			/>
		);

		expect( getByText( '0%' ) ).toBeVisible();
		expect( getByRole( 'progressbar' ) ).toHaveAttribute( 'value', '0' );
	} );

	test( 'renders 0% when mode is null', () => {
		const domainMappingStatus = createMockDomainMappingStatus( {
			mode: null,
			name_servers: [ 'ns1.wordpress.com', 'ns2.wordpress.com', 'ns3.wordpress.com' ],
		} );
		const domainConnectionSetupInfo = createMockDomainConnectionSetupInfo( {
			wpcom_name_servers: [ 'ns1.wordpress.com', 'ns2.wordpress.com', 'ns3.wordpress.com' ],
		} );

		const { getByRole, getByText } = render(
			<DnsPropagationProgressBar
				domainMappingStatus={ domainMappingStatus }
				domainConnectionSetupInfo={ domainConnectionSetupInfo }
			/>
		);

		expect( getByText( '0%' ) ).toBeVisible();
		expect( getByRole( 'progressbar' ) ).toHaveAttribute( 'value', '0' );
	} );

	describe( 'Cloudflare IP addresses', () => {
		test( 'renders 100% when has Cloudflare IP addresses and resolves to WordPress.com', () => {
			const domainMappingStatus = createMockDomainMappingStatus( {
				mode: DomainConnectionSetupMode.DONE,
				has_cloudflare_ip_addresses: true,
				resolves_to_wpcom: true,
			} );
			const domainConnectionSetupInfo = createMockDomainConnectionSetupInfo();

			const { getByRole, getByText } = render(
				<DnsPropagationProgressBar
					domainMappingStatus={ domainMappingStatus }
					domainConnectionSetupInfo={ domainConnectionSetupInfo }
				/>
			);

			expect( getByText( '100%' ) ).toBeVisible();
			expect( getByRole( 'progressbar' ) ).toHaveAttribute( 'value', '100' );
		} );

		test( 'renders 100% when has Cloudflare IP addresses and resolves to WordPress.com with null mode', () => {
			const domainMappingStatus = createMockDomainMappingStatus( {
				mode: null,
				has_cloudflare_ip_addresses: true,
				resolves_to_wpcom: true,
			} );
			const domainConnectionSetupInfo = createMockDomainConnectionSetupInfo();

			const { getByRole, getByText } = render(
				<DnsPropagationProgressBar
					domainMappingStatus={ domainMappingStatus }
					domainConnectionSetupInfo={ domainConnectionSetupInfo }
				/>
			);

			expect( getByText( '100%' ) ).toBeVisible();
			expect( getByRole( 'progressbar' ) ).toHaveAttribute( 'value', '100' );
		} );

		test( 'renders 0% when has Cloudflare IP addresses but does not resolve to WordPress.com', () => {
			const domainMappingStatus = createMockDomainMappingStatus( {
				mode: DomainConnectionSetupMode.DONE,
				has_cloudflare_ip_addresses: true,
				resolves_to_wpcom: false,
			} );
			const domainConnectionSetupInfo = createMockDomainConnectionSetupInfo();

			const { getByRole, getByText } = render(
				<DnsPropagationProgressBar
					domainMappingStatus={ domainMappingStatus }
					domainConnectionSetupInfo={ domainConnectionSetupInfo }
				/>
			);

			expect( getByText( '0%' ) ).toBeVisible();
			expect( getByRole( 'progressbar' ) ).toHaveAttribute( 'value', '0' );
		} );

		test( 'renders 0% when does not have Cloudflare IP addresses even if resolves to WordPress.com', () => {
			const domainMappingStatus = createMockDomainMappingStatus( {
				mode: DomainConnectionSetupMode.DONE,
				has_cloudflare_ip_addresses: false,
				resolves_to_wpcom: true,
			} );
			const domainConnectionSetupInfo = createMockDomainConnectionSetupInfo();

			const { getByRole, getByText } = render(
				<DnsPropagationProgressBar
					domainMappingStatus={ domainMappingStatus }
					domainConnectionSetupInfo={ domainConnectionSetupInfo }
				/>
			);

			expect( getByText( '0%' ) ).toBeVisible();
			expect( getByRole( 'progressbar' ) ).toHaveAttribute( 'value', '0' );
		} );

		test( 'prioritizes mode-specific logic over Cloudflare logic for SUGGESTED mode', () => {
			const domainMappingStatus = createMockDomainMappingStatus( {
				mode: DomainConnectionSetupMode.SUGGESTED,
				has_cloudflare_ip_addresses: true,
				resolves_to_wpcom: true,
				name_servers: [ 'ns1.wordpress.com', 'ns2.wordpress.com' ],
			} );
			const domainConnectionSetupInfo = createMockDomainConnectionSetupInfo( {
				wpcom_name_servers: [ 'ns1.wordpress.com', 'ns2.wordpress.com', 'ns3.wordpress.com' ],
			} );

			const { getByRole, getByText } = render(
				<DnsPropagationProgressBar
					domainMappingStatus={ domainMappingStatus }
					domainConnectionSetupInfo={ domainConnectionSetupInfo }
				/>
			);

			// Should show 67% based on name server matching, not 100% from Cloudflare
			expect( getByText( '67%' ) ).toBeVisible();
			expect( getByRole( 'progressbar' ) ).toHaveAttribute( 'value', '67' );
		} );

		test( 'prioritizes mode-specific logic over Cloudflare logic for ADVANCED mode', () => {
			const domainMappingStatus = createMockDomainMappingStatus( {
				mode: DomainConnectionSetupMode.ADVANCED,
				has_cloudflare_ip_addresses: true,
				resolves_to_wpcom: true,
				host_ip_addresses: [ '192.0.78.24' ],
			} );
			const domainConnectionSetupInfo = createMockDomainConnectionSetupInfo( {
				default_ip_addresses: [ '192.0.78.24', '192.0.78.25' ],
			} );

			const { getByRole, getByText } = render(
				<DnsPropagationProgressBar
					domainMappingStatus={ domainMappingStatus }
					domainConnectionSetupInfo={ domainConnectionSetupInfo }
				/>
			);

			// Should show 50% based on IP address matching, not 100% from Cloudflare
			expect( getByText( '50%' ) ).toBeVisible();
			expect( getByRole( 'progressbar' ) ).toHaveAttribute( 'value', '50' );
		} );
	} );
} );
