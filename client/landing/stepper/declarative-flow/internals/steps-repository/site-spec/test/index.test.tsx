/**
 * @jest-environment jsdom
 */
import { act, render } from '@testing-library/react';
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

jest.mock( 'calypso/lib/site-spec/utils', () => ( {
	getCiabSiteSpecConfig: jest.fn( () => ( { agentId: 'ciab-site-spec' } ) ),
	getEarlyProvisionSiteSpecConfig: jest.fn( () => ( { agentId: 'early-provision-site-spec' } ) ),
} ) );

jest.mock( 'calypso/lib/wp', () => ( {
	__esModule: true,
	default: { req: { post: jest.fn() } },
} ) );

describe( 'SiteSpec early provisioning step', () => {
	const originalLocation = window.location;
	const mockUseSiteSpec = useSiteSpec as jest.Mock;
	const wpcomPostMock = wpcom.req.post as jest.Mock;

	beforeEach( () => {
		jest.clearAllMocks();
		window.sessionStorage.clear();
		mockQueryParams = new URLSearchParams( 'early_provision_site=1&source=vega' );
		wpcomPostMock.mockResolvedValue( {
			blog_details: {
				blogid: 255716498,
			},
			atomic_transfer: {
				id: 123,
				status: 'pending',
			},
			early_provision_target: EARLY_PROVISION_TARGET_WPCOM_ATOMIC,
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

	it( 'starts WPCOM Atomic provisioning on the first message and redirects with the early-created site', async () => {
		render( <SiteSpec /> );

		const siteSpecOptions = mockUseSiteSpec.mock.calls[ 0 ][ 0 ];
		expect( siteSpecOptions.siteSpecConfig ).toEqual( {
			agentId: 'early-provision-site-spec',
		} );

		await act( async () => {
			siteSpecOptions.onMessage( { content: 'Build a bakery site' } );
		} );

		expect( wpcomPostMock ).toHaveBeenCalledTimes( 1 );
		expect( wpcomPostMock ).toHaveBeenCalledWith(
			{
				path: '/sites/new',
				apiVersion: '1.1',
			},
			{},
			{
				client_id: 'signup-id',
				client_secret: 'signup-key',
				blog_title: '',
				blog_name: '',
				options: {
					site_creation_flow: 'ai-site-builder',
					trigger_backend_build: false,
					early_provision_target: EARLY_PROVISION_TARGET_WPCOM_ATOMIC,
				},
			}
		);
		expect( wpcomPostMock.mock.calls[ 0 ][ 2 ] ).not.toHaveProperty( 'garden_name' );
		expect( wpcomPostMock.mock.calls[ 0 ][ 2 ] ).not.toHaveProperty( 'garden_partner_name' );

		await act( async () => {
			await siteSpecOptions.onSpecConfirm( { spec_id: 'spec-123' } );
		} );

		const redirect = new URL( window.location.href, 'https://wordpress.com' );
		expect( redirect.pathname ).toBe( '/setup/ai-site-builder/' );
		expect( redirect.searchParams.get( 'trigger_backend_build' ) ).toBe( '0' );
		expect( redirect.searchParams.get( 'spec_id' ) ).toBe( 'spec-123' );
		expect( redirect.searchParams.get( 'early_provision_target' ) ).toBe(
			EARLY_PROVISION_TARGET_WPCOM_ATOMIC
		);
		expect( redirect.searchParams.get( 'early_created_site' ) ).toBe( '255716498' );
		expect( redirect.searchParams.get( '_ph' ) ).toBe( 'ph-session' );
		expect( redirect.searchParams.get( 'source' ) ).toBe( 'vega' );
		expect( redirect.searchParams.has( 'create_garden_site' ) ).toBe( false );
	} );
} );
