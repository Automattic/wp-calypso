import {
	getBuildWowSiteIdentifier,
	getBuildWowSiteSpecUrl,
	isBuildWowEnabled,
	isBuildWowSiteEditorReady,
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
} );
