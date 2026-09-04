/**
 * @jest-environment jsdom
 */
import { useQuery as useReactQuery } from '@tanstack/react-query';
import { act, render } from '@testing-library/react';
import {
	applyBlueprintSpec,
	getSiteAdminUrl,
	isAtomicTransferComplete,
	startBlueprintArchiveImport,
	waitForAtomicTransferComplete,
	waitForBlueprintImportComplete,
} from 'calypso/landing/stepper/utils/blueprint-archive-import';
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
	getBlueprintSiteSpecConfig: jest.fn( () => ( { agentId: 'blueprint-site-spec' } ) ),
	getBuildWowSiteSpecConfig: jest.fn( () => ( { agentId: 'build-wow-site-spec' } ) ),
	getCiabSiteSpecConfig: jest.fn( () => ( { agentId: 'ciab-site-spec' } ) ),
	getEarlyProvisionSiteSpecConfig: jest.fn( () => ( { agentId: 'early-provision-site-spec' } ) ),
} ) );

const mockSetPendingAction = jest.fn();

jest.mock( '@wordpress/data', () => ( {
	useDispatch: () => ( { setPendingAction: mockSetPendingAction } ),
} ) );

jest.mock( 'calypso/landing/stepper/stores', () => ( {
	ONBOARD_STORE: 'automattic/onboard',
} ) );

// The wow-funnel helpers stay real so the funnel's readiness rules are exercised; only the
// requests they make are stubbed.
jest.mock( 'calypso/landing/stepper/utils/blueprint-archive-import', () => ( {
	applyBlueprintSpec: jest.fn( () => Promise.resolve( true ) ),
	getBlueprintArchiveSiteIdentifier: jest.fn(
		( { siteSlug, siteId }: { siteSlug?: string | null; siteId?: string | null } ) =>
			siteSlug || ( siteId && String( siteId ) !== '0' ? String( siteId ) : null )
	),
	getSiteAdminUrl: jest.fn( () => Promise.resolve( 'https://example.wordpress.com/wp-admin/' ) ),
	isAtomicTransferComplete: jest.fn( () => Promise.resolve( true ) ),
	getSiteEditorUrl: jest.fn( () => 'https://example.wordpress.com/wp-admin/site-editor.php' ),
	logBlueprintArchiveEvent: jest.fn(),
	startBlueprintArchiveImport: jest.fn( () => Promise.resolve() ),
	waitForAtomicTransferComplete: jest.fn( () => Promise.resolve() ),
	waitForBlueprintImportComplete: jest.fn( () => Promise.resolve() ),
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

	it( 'attaches a confirmed spec and redirects immediately to site generation', async () => {
		mockQueryParams = new URLSearchParams(
			'build_wow=1&siteSlug=example.wordpress.com&ref=site-card&source=site-overview'
		);
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

		const redirect = new URL( window.location.href, 'https://wordpress.com' );
		expect( redirect.pathname ).toBe( '/setup/ai-site-builder-spec/site-generation' );
		expect( redirect.searchParams.get( 'siteId' ) ).toBe( '123' );
		expect( redirect.searchParams.get( 'siteSlug' ) ).toBe( 'example.wordpress.com' );
		expect( redirect.searchParams.get( 'specId' ) ).toBe( 'spec-456' );
		expect( redirect.searchParams.get( 'ref' ) ).toBe( 'site-card' );
		expect( redirect.searchParams.get( 'source' ) ).toBe( 'site-overview' );
		expect( redirect.searchParams.get( 'editorUrl' ) ).toBe(
			'https://example.wordpress.com/wp-admin/site-editor.php?source=site-overview'
		);

		expect( logToLogstashMock ).toHaveBeenCalledWith(
			expect.objectContaining( {
				blog_id: 123,
				properties: expect.objectContaining( {
					type: 'build_wow_spec_confirm_response',
					spec_id: 'spec-456',
					site_identifier: 'example.wordpress.com',
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

describe( 'SiteSpec blueprint archive import', () => {
	const mockUseSiteSpec = useSiteSpec as jest.Mock;
	const navigation = { submit: jest.fn() };

	const renderSiteSpec = () =>
		render(
			<SiteSpec navigation={ navigation } stepName="site-spec" flow="ai-site-builder-spec" />
		);

	const confirmSpec = async () => {
		renderSiteSpec();

		const siteSpecOptions = mockUseSiteSpec.mock.calls[ 0 ][ 0 ];
		await act( async () => {
			await siteSpecOptions.onSpecConfirm( { spec_id: 'spec-789' } );
		} );
	};

	beforeEach( () => {
		jest.clearAllMocks();
		mockQueryParams = new URLSearchParams(
			'blueprint_archive_import=1&blueprint_slug=961&siteSlug=example.wordpress.com&wow_funnel=blueprint'
		);
	} );

	it( 'leaves the spec page for the waiting screen without waiting on the import first', async () => {
		await confirmSpec();

		expect( navigation.submit ).toHaveBeenCalled();
		expect( mockSetPendingAction ).toHaveBeenCalledTimes( 1 );
		// The poll belongs to the processing step now, so nothing has been asked for yet.
		expect( waitForAtomicTransferComplete ).not.toHaveBeenCalled();
		expect( waitForBlueprintImportComplete ).not.toHaveBeenCalled();
	} );

	it( 'prefetches the hand-off URL while the customer is still answering', async () => {
		renderSiteSpec();
		// Let the mount effect settle.
		await act( async () => {} );

		// One status check, never the poll — waiting belongs to the processing step.
		expect( isAtomicTransferComplete ).toHaveBeenCalledWith( 'example.wordpress.com' );
		expect( waitForAtomicTransferComplete ).not.toHaveBeenCalled();
		expect( getSiteAdminUrl ).toHaveBeenCalledTimes( 1 );

		const siteSpecOptions = mockUseSiteSpec.mock.calls[ 0 ][ 0 ];
		await act( async () => {
			await siteSpecOptions.onSpecConfirm( { spec_id: 'spec-789' } );
		} );

		const pendingAction = mockSetPendingAction.mock.calls[ 0 ][ 0 ];
		await expect( pendingAction() ).resolves.toEqual( {
			redirectTo: 'https://example.wordpress.com/wp-admin/site-editor.php',
		} );

		// Still one: confirm spent the prefetched URL instead of paying for it again.
		expect( getSiteAdminUrl ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'skips the prefetch while the site is still transferring', async () => {
		// admin_url changes when a site goes Atomic, so a URL read now would name the old site.
		( isAtomicTransferComplete as jest.Mock ).mockResolvedValueOnce( false );

		renderSiteSpec();
		await act( async () => {} );

		expect( getSiteAdminUrl ).not.toHaveBeenCalled();

		const siteSpecOptions = mockUseSiteSpec.mock.calls[ 0 ][ 0 ];
		await act( async () => {
			await siteSpecOptions.onSpecConfirm( { spec_id: 'spec-789' } );
		} );

		const pendingAction = mockSetPendingAction.mock.calls[ 0 ][ 0 ];
		await expect( pendingAction() ).resolves.toEqual( {
			redirectTo: 'https://example.wordpress.com/wp-admin/site-editor.php',
		} );

		// Fetched at confirm, once, now that the transfer is known to be done.
		expect( getSiteAdminUrl ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'polls the import from the waiting screen and hands back the site editor URL', async () => {
		await confirmSpec();

		const pendingAction = mockSetPendingAction.mock.calls[ 0 ][ 0 ];

		await expect( pendingAction() ).resolves.toEqual( {
			redirectTo: 'https://example.wordpress.com/wp-admin/site-editor.php',
		} );

		expect( waitForAtomicTransferComplete ).toHaveBeenCalledWith( 'example.wordpress.com', {
			initialDelayMs: 0,
		} );
		expect( waitForBlueprintImportComplete ).toHaveBeenCalledWith( 'example.wordpress.com', {
			initialDelayMs: 0,
		} );
		// Applied only after the restore, which replaces the site's options wholesale.
		expect( applyBlueprintSpec ).toHaveBeenCalledWith( 'example.wordpress.com', 'spec-789', '961' );
	} );

	it( 'reports a failed import to the waiting screen rather than swallowing it', async () => {
		( waitForBlueprintImportComplete as jest.Mock ).mockRejectedValueOnce(
			new Error( 'Import failed' )
		);

		await confirmSpec();

		const pendingAction = mockSetPendingAction.mock.calls[ 0 ][ 0 ];

		await expect( pendingAction() ).rejects.toThrow();
	} );

	it( 'never starts a second import for a funnel run', async () => {
		await confirmSpec();

		expect( startBlueprintArchiveImport ).not.toHaveBeenCalled();
	} );
} );
