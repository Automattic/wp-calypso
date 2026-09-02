import wpcom from 'calypso/lib/wp';
import {
	getBuildWowGraph,
	getBuildWowSiteIdentifier,
	getBuildWowSiteSpecUrl,
	isBuildWowEnabled,
	isBuildWowSiteEditorReady,
	requestBuildWowSite,
} from '../build-wow';

jest.mock( 'calypso/lib/logstash', () => ( {
	logToLogstash: jest.fn( () => Promise.resolve() ),
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

describe( 'build-wow utilities', () => {
	it( 'detects the build_wow query parameter', () => {
		expect( isBuildWowEnabled( new URLSearchParams( 'build_wow=1' ), true ) ).toBe( true );
		expect( isBuildWowEnabled( new URLSearchParams( 'build_wow=1' ), false ) ).toBe( false );
		expect( isBuildWowEnabled( new URLSearchParams( 'build_wow=0' ), true ) ).toBe( false );
	} );

	it( 'prefers the site slug as the site identifier', () => {
		expect(
			getBuildWowSiteIdentifier( {
				siteSlug: 'example.wordpress.com',
				siteId: 123,
			} )
		).toBe( 'example.wordpress.com' );
	} );

	it( 'falls back to a non-zero site id as the site identifier', () => {
		expect(
			getBuildWowSiteIdentifier( {
				siteSlug: '',
				siteId: 123,
			} )
		).toBe( '123' );
		expect(
			getBuildWowSiteIdentifier( {
				siteSlug: '',
				siteId: 0,
			} )
		).toBeNull();
	} );

	it( 'builds the Site Spec URL for the existing site build-wow flow', () => {
		const destination = getBuildWowSiteSpecUrl( {
			siteSlug: 'example.wordpress.com',
			siteId: 123,
			ref: 'referrer',
			source: 'vega',
		} );
		const url = new URL( destination, 'https://wordpress.com' );

		expect( url.pathname ).toBe( '/setup/ai-site-builder-spec/site-spec' );
		expect( url.searchParams.get( 'build_wow' ) ).toBe( '1' );
		expect( url.searchParams.get( 'siteSlug' ) ).toBe( 'example.wordpress.com' );
		expect( url.searchParams.get( 'siteId' ) ).toBe( '123' );
		expect( url.searchParams.get( 'ref' ) ).toBe( 'referrer' );
		expect( url.searchParams.get( 'source' ) ).toBe( 'vega' );
	} );

	it( 'treats Atomic sites with a ready remote option as editor-ready', () => {
		expect(
			isBuildWowSiteEditorReady( {
				atomic: {
					is_atomic: true,
				},
				remote_option_ready: true,
			} )
		).toBe( true );

		expect(
			isBuildWowSiteEditorReady( {
				atomic: {
					is_atomic: false,
				},
				remote_option_ready: true,
			} )
		).toBe( false );
	} );

	it( 'reads the requested graph and ignores anything it does not know', () => {
		expect( getBuildWowGraph( new URLSearchParams( 'graph=html-first' ) ) ).toBe( 'html-first' );
		expect( getBuildWowGraph( new URLSearchParams( 'graph=legacy' ) ) ).toBe( 'legacy' );

		// The server takes this as an enum and 400s on anything else, so a typo
		// has to read as "no graph" rather than break the build request.
		expect( getBuildWowGraph( new URLSearchParams( 'graph=htmlfirst' ) ) ).toBeUndefined();
		expect( getBuildWowGraph( new URLSearchParams( 'graph=' ) ) ).toBeUndefined();
		expect( getBuildWowGraph( new URLSearchParams( '' ) ) ).toBeUndefined();
	} );

	it( 'sends the graph only on the call that queues a build', async () => {
		const post = wpcom.req.post as jest.Mock;
		post.mockReset();
		post.mockResolvedValue( {} );

		await requestBuildWowSite( '123', 'spec-1', 'html-first' );
		expect( post.mock.calls[ 0 ][ 1 ] ).toEqual( { spec_id: 'spec-1', graph: 'html-first' } );

		// No spec means nothing is queued, so there is no build to record a
		// graph against.
		await requestBuildWowSite( '123', undefined, 'html-first' );
		expect( post.mock.calls[ 1 ][ 1 ] ).toEqual( {} );

		await requestBuildWowSite( '123', 'spec-1' );
		expect( post.mock.calls[ 2 ][ 1 ] ).toEqual( { spec_id: 'spec-1' } );
	} );
} );
