/**
 * @jest-environment jsdom
 */
import { useQuery as useReactQuery } from '@tanstack/react-query';
import { act, render } from '@testing-library/react';
import { logToLogstash } from 'calypso/lib/logstash';
import { useSiteSpec } from 'calypso/lib/site-spec';
import wpcom from 'calypso/lib/wp';
import { EARLY_PROVISION_TARGET_WPCOM_ATOMIC } from '../early-provisioning';
import SiteSpec from '../index';

let mockQueryParams = new URLSearchParams();

jest.mock( '@automattic/calypso-config', () => {
	return {
		__esModule: true,
		default: jest.fn( ( key: string ) => {
			const values: Record< string, string > = {
				wpcom_signup_id: 'signup-id',
				wpcom_signup_key: 'signup-key',
			};

			return values[ key ];
		} ),
	};
} );

jest.mock( '@automattic/posthog', () => ( {
	getSessionId: jest.fn( () => 'ph-session' ),
} ) );

jest.mock( '@automattic/api-queries', () => ( {
	isAutomatticianQuery: jest.fn( () => ( {
		queryKey: [ 'me', 'is-automattician' ],
		queryFn: jest.fn(),
	} ) ),
} ) );

jest.mock( '@tanstack/react-query', () => ( {
	useQuery: jest.fn( () => ( {
		data: true,
		isLoading: false,
	} ) ),
} ) );

jest.mock( 'i18n-calypso', () => ( {
	useTranslate: () => ( text: string ) => text,
} ) );

jest.mock( 'calypso/components/data/document-head', () => () => null );

jest.mock( 'calypso/landing/stepper/hooks/use-query', () => ( {
	useQuery: () => mockQueryParams,
} ) );

jest.mock( 'calypso/lib/site-spec', () => ( {
	useSiteSpec: jest.fn(),
} ) );

jest.mock( 'calypso/lib/logstash', () => ( {
	logToLogstash: jest.fn( () => Promise.resolve() ),
} ) );

jest.mock( 'calypso/lib/site-spec/utils', () => ( {
	getBuildWowSiteSpecConfig: jest.fn( () => ( { agentId: 'build-wow-site-spec' } ) ),
	getCiabSiteSpecConfig: jest.fn( () => ( { agentId: 'ciab-site-spec' } ) ),
	getEarlyProvisionSiteSpecConfig: jest.fn( () => ( { agentId: 'early-provision-site-spec' } ) ),
} ) );

jest.mock( 'calypso/lib/wp', () => ( {
	__esModule: true,
	default: {
		req: {
			get: jest.fn(),
			post: jest.fn(),
		},
	},
} ) );

describe( 'SiteSpec early provisioning step', () => {
	const originalLocation = window.location;
	const mockUseSiteSpec = useSiteSpec as jest.Mock;
	const wpcomPostMock = wpcom.req.post as jest.Mock;
	const logToLogstashMock = logToLogstash as jest.Mock;
	const mockUseReactQuery = useReactQuery as jest.Mock;
	const navigation = {
		submit: jest.fn(),
	};

	const renderSiteSpec = () =>
		render(
			<SiteSpec navigation={ navigation } stepName="site-spec" flow="ai-site-builder-spec" />
		);

	beforeEach( () => {
		jest.clearAllMocks();
		window.sessionStorage.clear();
		mockQueryParams = new URLSearchParams( 'early_provision_site=1&source=vega' );
		mockUseReactQuery.mockReturnValue( {
			data: true,
			isLoading: false,
		} );
		Object.defineProperty( window, 'location', {
			value: { href: '' },
			writable: true,
			configurable: true,
		} );
	} );

	afterEach( () => {
		Object.defineProperty( window, 'location', {
			value: originalLocation,
			writable: true,
			configurable: true,
		} );
	} );

	it( 'redirects to WPCOM Atomic provisioning after the spec is confirmed', async () => {
		renderSiteSpec();

		const siteSpecOptions = mockUseSiteSpec.mock.calls[ 0 ][ 0 ];
		expect( siteSpecOptions.siteSpecConfig ).toEqual( {
			agentId: 'early-provision-site-spec',
		} );
		expect( siteSpecOptions.onMessage ).toBeUndefined();

		await act( async () => {
			await siteSpecOptions.onSpecConfirm( { spec_id: 'spec-123' } );
		} );

		const redirect = new URL( window.location.href, 'https://wordpress.com' );
		expect( redirect.pathname ).toBe( '/setup/ai-site-builder/' );
		expect( redirect.searchParams.get( 'trigger_backend_build' ) ).toBe( '0' );
		expect( redirect.searchParams.get( 'spec_id' ) ).toBe( 'spec-123' );
		expect( redirect.searchParams.get( 'provision_target' ) ).toBe(
			EARLY_PROVISION_TARGET_WPCOM_ATOMIC
		);
		expect( redirect.searchParams.has( 'early_created_site' ) ).toBe( false );
		expect( redirect.searchParams.get( '_ph' ) ).toBe( 'ph-session' );
		expect( redirect.searchParams.get( 'source' ) ).toBe( 'vega' );
		expect( redirect.searchParams.has( 'create_garden_site' ) ).toBe( false );
	} );

	it( 'attaches a confirmed spec to the existing build-wow site and redirects to Site Editor', async () => {
		mockQueryParams = new URLSearchParams( 'build_wow=1&siteSlug=example.wordpress.com' );
		wpcomPostMock.mockResolvedValue( {
			blog_id: 123,
			site_editor_url: 'https://example.wordpress.com/wp-admin/site-editor.php',
			atomic: {
				is_atomic: true,
				ready_for_editor: true,
			},
			remote_option_ready: true,
		} );

		renderSiteSpec();

		const siteSpecOptions = mockUseSiteSpec.mock.calls[ 0 ][ 0 ];
		expect( siteSpecOptions.siteSpecConfig ).toEqual( {
			agentId: 'build-wow-site-spec',
		} );

		await act( async () => {
			await siteSpecOptions.onSpecConfirm( { spec_id: 'spec-456' } );
		} );

		expect( wpcomPostMock ).toHaveBeenCalledWith(
			{
				path: '/sites/example.wordpress.com/big-sky/build-wow',
				apiNamespace: 'wpcom/v2',
			},
			{
				spec_id: 'spec-456',
			}
		);

		const redirect = new URL( window.location.href );
		expect( redirect.pathname ).toBe( '/wp-admin/site-editor.php' );
		expect( redirect.searchParams.get( 'spec_id' ) ).toBe( 'spec-456' );

		expect( logToLogstashMock ).toHaveBeenCalledWith(
			expect.objectContaining( {
				blog_id: 123,
				properties: expect.objectContaining( {
					type: 'build_wow_spec_confirm_response',
					spec_id: 'spec-456',
					site_identifier: 'example.wordpress.com',
					ready_for_editor: true,
					atomic_ready_for_editor: true,
					remote_option_ready: true,
					is_atomic: true,
				} ),
			} )
		);
	} );

	it( 'ignores build-wow Site Spec routing for non-Automatticians', () => {
		mockQueryParams = new URLSearchParams( 'build_wow=1&siteSlug=example.wordpress.com' );
		mockUseReactQuery.mockReturnValue( {
			data: false,
			isLoading: false,
		} );

		renderSiteSpec();

		const siteSpecOptions = mockUseSiteSpec.mock.calls[ 0 ][ 0 ];
		expect( siteSpecOptions.siteSpecConfig ).toBeUndefined();
		expect( siteSpecOptions.onSpecConfirm ).toBeUndefined();
		expect( wpcomPostMock ).not.toHaveBeenCalled();
	} );
} );
