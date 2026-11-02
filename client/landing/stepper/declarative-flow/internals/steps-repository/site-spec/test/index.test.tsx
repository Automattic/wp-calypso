/**
 * @jest-environment jsdom
 */
import { act, render, waitFor } from '@testing-library/react';
import {
	applyBlueprintSpec,
	getSiteAdminUrl,
	lookupBlueprintArchive,
	startBlueprintArchiveImport,
	startBlueprintSimpleImport,
	waitForAtomicTransferComplete,
	waitForBlueprintImportComplete,
} from 'calypso/landing/stepper/utils/blueprint-archive-import';
import { logToLogstash } from 'calypso/lib/logstash';
import { useSiteSpec } from 'calypso/lib/site-spec';
import { getBlueprintSiteSpecConfig, getBuildWowSiteSpecConfig } from 'calypso/lib/site-spec/utils';
import wpcom from 'calypso/lib/wp';
import { EARLY_PROVISION_TARGET_WPCOM_ATOMIC } from '../early-provisioning';
import SiteSpec from '../index';

let mockQueryParams = new URLSearchParams();
// Streaming is on in every environment, so builds ask for the live feed.
const STREAMING_ONLY = [ 'site-spec/build-wow-streaming' ];
let mockFlags = new Set( STREAMING_ONLY );

jest.mock( '@automattic/calypso-config', () => {
	return {
		__esModule: true,
		default: Object.assign(
			jest.fn( ( key: string ) => {
				const values: Record< string, string > = {
					wpcom_signup_id: 'signup-id',
					wpcom_signup_key: 'signup-key',
				};

				return values[ key ];
			} ),
			{ isEnabled: ( flag: string ) => mockFlags.has( flag ) }
		),
	};
} );

jest.mock( '@automattic/onboarding', () => ( {
	Step: { Loading: () => null },
} ) );

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
const mockSetSiteSetupError = jest.fn();

jest.mock( '@wordpress/data', () => ( {
	useDispatch: () => ( {
		setPendingAction: mockSetPendingAction,
		setSiteSetupError: mockSetSiteSetupError,
	} ),
} ) );

jest.mock( 'calypso/landing/stepper/stores', () => ( {
	ONBOARD_STORE: 'automattic/onboard',
	SITE_STORE: 'automattic/site',
} ) );

// The wow-funnel helpers stay real so the funnel's readiness rules are exercised; only the
// requests they make are stubbed.
jest.mock( 'calypso/landing/stepper/utils/blueprint-archive-import', () => ( {
	BLUEPRINT_SIMPLE_IMPORT_QUERY_PARAM: 'blueprint_simple_import',
	applyBlueprintSpec: jest.fn( () => Promise.resolve( { applied: true, adminUrl: null } ) ),
	getBlueprintArchiveSiteIdentifier: jest.fn(
		( { siteSlug, siteId }: { siteSlug?: string | null; siteId?: string | null } ) =>
			siteSlug || ( siteId && String( siteId ) !== '0' ? String( siteId ) : null )
	),
	getSimpleSiteEditorUrl: jest.fn(
		( adminUrl: string ) => `${ adminUrl }site-editor.php?simple=1`
	),
	getSiteAdminUrl: jest.fn( () => Promise.resolve( 'https://example.wordpress.com/wp-admin/' ) ),
	getSiteEditorUrl: jest.fn( () => 'https://example.wordpress.com/wp-admin/site-editor.php' ),
	getSpecMetaFromQuery: ( queryParams: URLSearchParams ) => {
		const url = queryParams.get( 'zoom_booking_url' );
		const title = queryParams.get( 'site_title' );
		return {
			...( url ? { zoom_booking_url: url } : {} ),
			...( title ? { site_title: title } : {} ),
		};
	},
	isPrefillComplete: ( prefill: string[], specMeta: Record< string, string > ) =>
		prefill.length > 0 && prefill.every( ( name ) => typeof specMeta[ name ] === 'string' ),
	lookupBlueprintArchive: jest.fn( () =>
		Promise.resolve( { exists: true, title: '', suggestedPlans: [], prefill: [] } )
	),
	isBlueprintCustomThemeBuild: ( queryParams: URLSearchParams ) =>
		queryParams.get( 'build' ) === 'custom-theme',
	logBlueprintArchiveEvent: jest.fn(),
	startBlueprintArchiveImport: jest.fn( () => Promise.resolve() ),
	startBlueprintSimpleImport: jest.fn( () => Promise.resolve() ),
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
		mockFlags = new Set( STREAMING_ONLY );
		mockQueryParams = new URLSearchParams( 'early_provision_site=1&source=vega' );
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
				stream_events: true,
			}
		);

		const redirect = new URL( window.location.href, 'https://wordpress.com' );
		expect( redirect.pathname ).toBe( '/setup/ai-site-builder-spec/site-generation' );
		expect( redirect.searchParams.get( 'siteId' ) ).toBe( '123' );
		expect( redirect.searchParams.get( 'siteSlug' ) ).toBe( 'example.wordpress.com' );
		expect( redirect.searchParams.get( 'specId' ) ).toBe( 'spec-456' );
		expect( redirect.searchParams.get( 'ref' ) ).toBe( 'site-card' );
		expect( redirect.searchParams.get( 'source' ) ).toBe( 'site-overview' );
		expect( redirect.searchParams.has( 'editorUrl' ) ).toBe( false );

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

	it( 'continues the design the user picked in the widget', async () => {
		mockFlags = new Set( [ ...STREAMING_ONLY, 'site-spec/design-candidates' ] );
		mockQueryParams = new URLSearchParams(
			'build_wow=1&siteSlug=example.wordpress.com&ref=site-card&source=site-overview'
		);
		wpcomPostMock.mockResolvedValue( {
			blog_id: 123,
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
			await siteSpecOptions.onSpecConfirm( { spec_id: 'spec-456', designCandidateId: '2' } );
		} );

		expect( wpcomPostMock ).toHaveBeenCalledWith(
			{
				path: '/sites/example.wordpress.com/big-sky/build-wow',
				apiNamespace: 'wpcom/v2',
			},
			{
				spec_id: 'spec-456',
				stream_events: true,
				design_candidate: 2,
			}
		);
		expect( getBuildWowSiteSpecConfig ).toHaveBeenCalledWith(
			expect.objectContaining( { designPicker: true } )
		);

		const redirect = new URL( window.location.href, 'https://wordpress.com' );
		expect( redirect.pathname ).toBe( '/setup/ai-site-builder-spec/site-generation' );
		expect( redirect.searchParams.get( 'siteId' ) ).toBe( '123' );
		expect( redirect.searchParams.get( 'siteSlug' ) ).toBe( 'example.wordpress.com' );
		expect( redirect.searchParams.get( 'specId' ) ).toBe( 'spec-456' );
		expect( redirect.searchParams.get( 'designCandidate' ) ).toBe( '2' );
		// The server picks the graph of a continued design; the client asks for none.
		expect( redirect.searchParams.has( 'graph' ) ).toBe( false );
		expect( redirect.searchParams.get( 'ref' ) ).toBe( 'site-card' );
		expect( redirect.searchParams.get( 'source' ) ).toBe( 'site-overview' );
		expect( redirect.searchParams.has( 'editorUrl' ) ).toBe( false );

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
		expect( logToLogstashMock ).toHaveBeenCalledWith(
			expect.objectContaining( {
				properties: expect.objectContaining( {
					type: 'build_wow_spec_confirm_request_start',
					design_candidate: '2',
					graph: null,
				} ),
			} )
		);
	} );

	it( 'drops a pick while the design candidates flag is off', async () => {
		mockQueryParams = new URLSearchParams( 'build_wow=1&siteSlug=example.wordpress.com' );
		wpcomPostMock.mockResolvedValue( { blog_id: 123 } );

		renderSiteSpec();
		const siteSpecOptions = mockUseSiteSpec.mock.calls[ 0 ][ 0 ];
		expect( getBuildWowSiteSpecConfig ).toHaveBeenCalledWith(
			expect.objectContaining( { designPicker: false } )
		);
		await act( async () => {
			await siteSpecOptions.onSpecConfirm( { spec_id: 'spec-off', designCandidateId: '2' } );
		} );
		expect( wpcomPostMock ).toHaveBeenLastCalledWith( expect.anything(), {
			spec_id: 'spec-off',
			stream_events: true,
		} );
	} );

	it( 'drops an invalid pick', async () => {
		mockFlags = new Set( [ ...STREAMING_ONLY, 'site-spec/design-candidates' ] );
		mockQueryParams = new URLSearchParams( 'build_wow=1&siteSlug=example.wordpress.com' );
		wpcomPostMock.mockResolvedValue( { blog_id: 123 } );

		renderSiteSpec();
		const siteSpecOptions = mockUseSiteSpec.mock.calls[ 0 ][ 0 ];
		await act( async () => {
			await siteSpecOptions.onSpecConfirm( { spec_id: 'spec-bad', designCandidateId: '7' } );
		} );
		expect( wpcomPostMock ).toHaveBeenLastCalledWith( expect.anything(), {
			spec_id: 'spec-bad',
			stream_events: true,
		} );
	} );

	it( 'confirms a carried spec with the design from the build URL', async () => {
		mockFlags = new Set( [ ...STREAMING_ONLY, 'site-spec/design-candidates' ] );
		mockQueryParams = new URLSearchParams(
			'build_wow=1&siteSlug=example.wordpress.com&spec_id=spec-url&design_candidate=3'
		);
		wpcomPostMock.mockResolvedValue( { blog_id: 123 } );

		await act( async () => {
			renderSiteSpec();
		} );

		expect( wpcomPostMock ).toHaveBeenCalledWith(
			expect.objectContaining( { path: '/sites/example.wordpress.com/big-sky/build-wow' } ),
			{ spec_id: 'spec-url', stream_events: true, design_candidate: 3 }
		);
		const redirect = new URL( window.location.href, 'https://wordpress.com' );
		expect( redirect.searchParams.get( 'designCandidate' ) ).toBe( '3' );
	} );

	it( 'builds on the requested graph and carries it to site generation for retries', async () => {
		mockQueryParams = new URLSearchParams(
			'build_wow=1&siteSlug=example.wordpress.com&spec_id=spec-dsl&graph=dsl'
		);
		wpcomPostMock.mockResolvedValue( {
			blog_id: 123,
			site_editor_url: 'https://example.wordpress.com/wp-admin/site-editor.php',
		} );

		await act( async () => {
			renderSiteSpec();
		} );

		expect( wpcomPostMock ).toHaveBeenCalledWith(
			expect.objectContaining( { path: '/sites/example.wordpress.com/big-sky/build-wow' } ),
			{ spec_id: 'spec-dsl', graph: 'dsl', stream_events: true }
		);
		const redirect = new URL( window.location.href, 'https://wordpress.com' );
		expect( redirect.pathname ).toBe( '/setup/ai-site-builder-spec/site-generation' );
		expect( redirect.searchParams.get( 'graph' ) ).toBe( 'dsl' );
	} );

	it( 'leaves build-wow routing alone when build_wow is not requested', () => {
		mockQueryParams = new URLSearchParams( 'siteSlug=example.wordpress.com' );

		renderSiteSpec();

		const siteSpecOptions = mockUseSiteSpec.mock.calls[ 0 ][ 0 ];
		expect( siteSpecOptions.siteSpecConfig ).toBeUndefined();
		expect( siteSpecOptions.onSpecConfirm ).toBeUndefined();
		expect( wpcomPostMock ).not.toHaveBeenCalled();
	} );

	it( 'confirms a spec carried from entry without loading the interview widget', async () => {
		mockQueryParams = new URLSearchParams(
			'build_wow=1&siteSlug=example.wordpress.com&spec_id=spec-entry'
		);
		wpcomPostMock.mockResolvedValue( {
			blog_id: 123,
			site_editor_url: 'https://example.wordpress.com/wp-admin/site-editor.php',
		} );

		await act( async () => {
			renderSiteSpec();
		} );

		expect( mockUseSiteSpec ).not.toHaveBeenCalled();
		expect( wpcomPostMock ).toHaveBeenCalledWith(
			expect.objectContaining( { path: '/sites/example.wordpress.com/big-sky/build-wow' } ),
			{ spec_id: 'spec-entry', stream_events: true }
		);
		const redirect = new URL( window.location.href, 'https://wordpress.com' );
		expect( redirect.pathname ).toBe( '/setup/ai-site-builder-spec/site-generation' );
		expect( redirect.searchParams.get( 'specId' ) ).toBe( 'spec-entry' );
	} );

	it( 'sends a failed build request to the error step', async () => {
		mockQueryParams = new URLSearchParams( 'build_wow=1&siteSlug=example.wordpress.com' );
		wpcomPostMock.mockRejectedValue( new Error( 'Forbidden' ) );

		renderSiteSpec();

		const siteSpecOptions = mockUseSiteSpec.mock.calls[ 0 ][ 0 ];
		await act( async () => {
			await siteSpecOptions.onSpecConfirm( { spec_id: 'spec-456' } );
		} );

		expect( mockSetSiteSetupError ).toHaveBeenCalledWith( 'build_wow_request_failed', 'Forbidden' );
		expect( navigation.submit ).toHaveBeenCalledWith( {
			buildWowError: 'build_wow_request_failed',
		} );
		expect( window.location.href ).toBe( '' );
	} );

	it( 'starts the Atomic transfer when the interview opens, before any spec is confirmed', async () => {
		mockQueryParams = new URLSearchParams(
			'build_wow=1&siteSlug=example.wordpress.com&source=sites-dashboard'
		);
		wpcomPostMock.mockResolvedValue( { blog_id: 123 } );

		await act( async () => {
			renderSiteSpec();
		} );

		expect( mockUseSiteSpec ).toHaveBeenCalled();
		expect( wpcomPostMock ).toHaveBeenCalledTimes( 1 );
		expect( wpcomPostMock ).toHaveBeenCalledWith(
			{ path: '/sites/example.wordpress.com/big-sky/build-wow', apiNamespace: 'wpcom/v2' },
			{}
		);
		expect( window.location.href ).toBe( '' );
	} );

	it( 'keeps the interview open when the early transfer request fails', async () => {
		mockQueryParams = new URLSearchParams( 'build_wow=1&siteSlug=example.wordpress.com' );
		wpcomPostMock.mockRejectedValue( new Error( 'Forbidden' ) );

		await act( async () => {
			renderSiteSpec();
		} );

		expect( wpcomPostMock ).toHaveBeenCalledTimes( 1 );
		expect( mockSetSiteSetupError ).not.toHaveBeenCalled();
		expect( navigation.submit ).not.toHaveBeenCalled();
	} );

	it( 'goes straight to the error step when build_wow has no target site', () => {
		mockQueryParams = new URLSearchParams( 'build_wow=1' );

		renderSiteSpec();

		expect( mockUseSiteSpec ).not.toHaveBeenCalled();
		expect( wpcomPostMock ).not.toHaveBeenCalled();
		expect( mockSetSiteSetupError ).toHaveBeenCalledWith(
			'build_wow_missing_site',
			expect.any( String )
		);
		expect( navigation.submit ).toHaveBeenCalledWith( { buildWowError: 'build_wow_missing_site' } );
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

		// A Simple build mounts the widget only once the blueprint lookup has said an
		// interview is needed.
		await waitFor( () => expect( mockUseSiteSpec ).toHaveBeenCalled() );
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
		// The funnel's readiness wait ends by asking whether the customer can sign in to the site.
		( wpcom.req.get as jest.Mock ).mockResolvedValue( { ready: true } );
	} );

	it( 'leaves the spec page for the waiting screen without waiting on the import first', async () => {
		await confirmSpec();

		expect( navigation.submit ).toHaveBeenCalled();
		expect( mockSetPendingAction ).toHaveBeenCalledTimes( 1 );
		// The poll belongs to the processing step now, so nothing has been asked for yet.
		expect( waitForAtomicTransferComplete ).not.toHaveBeenCalled();
		expect( waitForBlueprintImportComplete ).not.toHaveBeenCalled();
	} );

	it( 'uses the admin URL from the apply response, so confirm does not fetch it', async () => {
		( applyBlueprintSpec as jest.Mock ).mockResolvedValueOnce( {
			applied: true,
			adminUrl: 'https://example.wpcomstaging.com/wp-admin/',
		} );

		await confirmSpec();

		const pendingAction = mockSetPendingAction.mock.calls[ 0 ][ 0 ];
		await expect( pendingAction() ).resolves.toEqual( {
			redirectTo: 'https://example.wordpress.com/wp-admin/site-editor.php',
		} );

		// The response already knew the admin base, so the extra /sites/<id> round trip is skipped
		// — that request is the one this change exists to remove from the hand-off.
		expect( getSiteAdminUrl ).not.toHaveBeenCalled();
	} );

	it( 'falls back to fetching the admin URL when the response has none', async () => {
		// A wpcom that predates the field. The hand-off must still work, just a round trip slower.
		( applyBlueprintSpec as jest.Mock ).mockResolvedValueOnce( { applied: true, adminUrl: null } );

		await confirmSpec();

		const pendingAction = mockSetPendingAction.mock.calls[ 0 ][ 0 ];
		await expect( pendingAction() ).resolves.toEqual( {
			redirectTo: 'https://example.wordpress.com/wp-admin/site-editor.php',
		} );

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

	describe( 'Simple build (blueprint_simple_import=1)', () => {
		beforeEach( () => {
			mockQueryParams = new URLSearchParams(
				'blueprint_simple_import=1&blueprint_slug=zoom&siteSlug=example.wordpress.com&siteId=123&zoom_booking_url=https%3A%2F%2Fscheduler.zoom.us%2Fjason'
			);
		} );

		it( 'starts the Simple import when the interview opens, never the archive restore', async () => {
			renderSiteSpec();

			// The booking URL from the entry link rides along, so the import can write it into
			// the blueprint content's placeholder without an agent. The blueprint declares no
			// prefill, so the interview runs and the import is not asked to confirm the spec.
			await waitFor( () =>
				expect( startBlueprintSimpleImport ).toHaveBeenCalledWith(
					'example.wordpress.com',
					'zoom',
					123,
					{ zoom_booking_url: 'https://scheduler.zoom.us/jason' },
					{ applySpec: false }
				)
			);
			// The archive restore converts the site to Atomic, which a Simple build must never do.
			expect( startBlueprintArchiveImport ).not.toHaveBeenCalled();
		} );

		it( 'starts the import with no site values when the entry link carried none', async () => {
			mockQueryParams = new URLSearchParams(
				'blueprint_simple_import=1&blueprint_slug=zoom&siteSlug=example.wordpress.com&siteId=123'
			);

			renderSiteSpec();

			await waitFor( () =>
				expect( startBlueprintSimpleImport ).toHaveBeenCalledWith(
					'example.wordpress.com',
					'zoom',
					123,
					{},
					{ applySpec: false }
				)
			);
		} );

		// The partner's hand-off settled everything the blueprint asks: no interview, the
		// import confirms the spec, and this page waits on it and hands over.
		it( 'skips the interview and hands over after the import when the partner settled the spec', async () => {
			( lookupBlueprintArchive as jest.Mock ).mockResolvedValueOnce( {
				exists: true,
				title: 'zoom test',
				suggestedPlans: [],
				prefill: [ 'site_title' ],
			} );
			mockQueryParams = new URLSearchParams(
				'blueprint_simple_import=1&blueprint_slug=zoom&siteSlug=example.wordpress.com&siteId=123&zoom_booking_url=https%3A%2F%2Fscheduler.zoom.us%2Fjason&site_title=Cedar%20Keel'
			);

			renderSiteSpec();

			await waitFor( () =>
				expect( startBlueprintSimpleImport ).toHaveBeenCalledWith(
					'example.wordpress.com',
					'zoom',
					123,
					{ zoom_booking_url: 'https://scheduler.zoom.us/jason', site_title: 'Cedar Keel' },
					{ applySpec: true }
				)
			);
			await waitFor( () => expect( mockSetPendingAction ).toHaveBeenCalled() );

			// No interview widget was configured for this run.
			expect( getBlueprintSiteSpecConfig ).not.toHaveBeenCalled();
			expect( navigation.submit ).toHaveBeenCalled();

			const pendingAction = mockSetPendingAction.mock.calls[ 0 ][ 0 ];
			await expect( pendingAction() ).resolves.toEqual( {
				redirectTo: 'https://example.wordpress.com/wp-admin/site-editor.php?simple=1',
			} );
			expect( waitForBlueprintImportComplete ).toHaveBeenCalledWith( 'example.wordpress.com' );
			// The import applied the spec; nothing here applies it again.
			expect( applyBlueprintSpec ).not.toHaveBeenCalled();
		} );

		// The partner supplied only part of what the blueprint asks: the interview runs.
		it( 'runs the interview when the partner settled only part of the spec', async () => {
			( lookupBlueprintArchive as jest.Mock ).mockResolvedValueOnce( {
				exists: true,
				title: 'zoom test',
				suggestedPlans: [],
				prefill: [ 'site_title', 'zoom_booking_url' ],
			} );

			renderSiteSpec();

			await waitFor( () =>
				expect( startBlueprintSimpleImport ).toHaveBeenCalledWith(
					'example.wordpress.com',
					'zoom',
					123,
					{ zoom_booking_url: 'https://scheduler.zoom.us/jason' },
					{ applySpec: false }
				)
			);
			await waitFor( () => expect( getBlueprintSiteSpecConfig ).toHaveBeenCalled() );
			expect( mockSetPendingAction ).not.toHaveBeenCalled();
			expect( navigation.submit ).not.toHaveBeenCalled();
		} );

		// The lookup is only a hint; a failing one must never keep the interview from mounting.
		it( 'runs the interview when the blueprint lookup fails', async () => {
			( lookupBlueprintArchive as jest.Mock ).mockRejectedValueOnce( new Error( 'network' ) );

			renderSiteSpec();

			await waitFor( () => expect( getBlueprintSiteSpecConfig ).toHaveBeenCalled() );
			expect( startBlueprintSimpleImport ).toHaveBeenCalledWith(
				'example.wordpress.com',
				'zoom',
				123,
				{ zoom_booking_url: 'https://scheduler.zoom.us/jason' },
				{ applySpec: false }
			);
			expect( mockSetPendingAction ).not.toHaveBeenCalled();
		} );

		// With no site-spec step to report a failed import start, the interview is the way the
		// customer learns about it: a partner run that cannot start its import falls back to it.
		it( 'falls back to the interview when the import cannot be started on a partner run', async () => {
			( lookupBlueprintArchive as jest.Mock ).mockResolvedValueOnce( {
				exists: true,
				title: 'zoom test',
				suggestedPlans: [],
				prefill: [ 'site_title' ],
			} );
			( startBlueprintSimpleImport as jest.Mock ).mockRejectedValueOnce(
				new Error( 'import_exists' )
			);
			mockQueryParams = new URLSearchParams(
				'blueprint_simple_import=1&blueprint_slug=zoom&siteSlug=example.wordpress.com&siteId=123&site_title=Cedar%20Keel'
			);

			renderSiteSpec();

			await waitFor( () => expect( getBlueprintSiteSpecConfig ).toHaveBeenCalled() );
			expect( mockSetPendingAction ).not.toHaveBeenCalled();
			expect( navigation.submit ).not.toHaveBeenCalled();
		} );

		it( 'waits on the import alone, applies the spec and hands over to the site editor directly', async () => {
			await confirmSpec();

			const pendingAction = mockSetPendingAction.mock.calls[ 0 ][ 0 ];
			await expect( pendingAction() ).resolves.toEqual( {
				redirectTo: 'https://example.wordpress.com/wp-admin/site-editor.php?simple=1',
			} );

			// No Atomic transfer to wait for on a Simple site.
			expect( waitForAtomicTransferComplete ).not.toHaveBeenCalled();
			expect( waitForBlueprintImportComplete ).toHaveBeenCalledWith( 'example.wordpress.com' );
			// Applied only after the import, with the blueprint named so the apply need not
			// rely on the provenance the import stamped.
			expect( applyBlueprintSpec ).toHaveBeenCalledWith(
				'example.wordpress.com',
				'spec-789',
				'zoom'
			);
		} );

		it( 'runs the blueprint-aware interview with the spec meta the entry URL carried', async () => {
			renderSiteSpec();

			await waitFor( () =>
				expect( getBlueprintSiteSpecConfig ).toHaveBeenCalledWith( {
					blueprintId: 'zoom',
					specMeta: { zoom_booking_url: 'https://scheduler.zoom.us/jason' },
				} )
			);
		} );
	} );

	describe( 'build=custom-theme', () => {
		const wpcomPostMock = wpcom.req.post as jest.Mock;

		beforeEach( () => {
			mockQueryParams = new URLSearchParams(
				'blueprint_archive_import=1&blueprint_slug=961&siteSlug=example.wordpress.com&wow_funnel=blueprint&build=custom-theme'
			);
			wpcomPostMock.mockResolvedValue( {
				blog_id: 123,
				build: { status: 'queued' },
			} );
		} );

		it( 'sends the spec to the generator once the restore is done, instead of applying it', async () => {
			await confirmSpec();

			const pendingAction = mockSetPendingAction.mock.calls[ 0 ][ 0 ];
			const { redirectTo } = await pendingAction();

			expect( waitForBlueprintImportComplete ).toHaveBeenCalled();
			expect( applyBlueprintSpec ).not.toHaveBeenCalled();
			// blueprint_id is what lets the server take a site that is already on Atomic.
			expect( wpcomPostMock ).toHaveBeenCalledWith(
				{ path: '/sites/example.wordpress.com/big-sky/build-wow', apiNamespace: 'wpcom/v2' },
				{ spec_id: 'spec-789', blueprint_id: '961', stream_events: true }
			);

			const destination = new URL( redirectTo, 'https://wordpress.com' );
			expect( destination.pathname ).toBe( '/setup/ai-site-builder-spec/site-generation' );
			expect( destination.searchParams.get( 'build_wow' ) ).toBe( '1' );
			expect( destination.searchParams.get( 'specId' ) ).toBe( 'spec-789' );
			expect( destination.searchParams.get( 'siteId' ) ).toBe( '123' );
			expect( destination.searchParams.has( 'editorUrl' ) ).toBe( false );
		} );

		it( 'keeps the blueprint out of the interview so the full design brief is asked', () => {
			renderSiteSpec();

			expect( getBlueprintSiteSpecConfig ).toHaveBeenCalledWith(
				expect.objectContaining( { blueprintId: undefined } )
			);
		} );

		it( 'still never starts a second import', async () => {
			await confirmSpec();

			expect( startBlueprintArchiveImport ).not.toHaveBeenCalled();
		} );
	} );
} );
