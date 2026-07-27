import config from '@automattic/calypso-config';
import { calypsoLiveLink } from '../calypso-live';

jest.mock( '@automattic/calypso-config', () => jest.fn() );

const IMAGE_REF = 'registry.a8c.com/calypso/app:build-189947';

const mockedConfig = jest.mocked( config );

function mockImage( image: string | false ) {
	mockedConfig.mockImplementation( ( key: string ) =>
		key === 'calypso_live_image' ? image : undefined
	);
}

describe( 'calypsoLiveLink', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockImage( IMAGE_REF );
	} );

	it( 'returns null when not on a calypso.live preview', () => {
		mockImage( false );
		expect( calypsoLiveLink( '/domains/add/foo.blog' ) ).toBeNull();
	} );

	it( 'points at the redirector without an env for classic Calypso', () => {
		const url = new URL( calypsoLiveLink( '/domains/add/foo.blog' ) ?? '' );

		expect( url.origin + url.pathname ).toBe( 'https://calypso.live/domains/add/foo.blog' );
		expect( url.searchParams.get( 'image' ) ).toBe( IMAGE_REF );
		expect( url.searchParams.get( 'env' ) ).toBeNull();
	} );

	it( 'adds the env for the dotcom Dashboard', () => {
		const url = new URL( calypsoLiveLink( '/sites', 'dashboard' ) ?? '' );

		expect( url.searchParams.get( 'image' ) ).toBe( IMAGE_REF );
		expect( url.searchParams.get( 'env' ) ).toBe( 'dashboard' );
	} );

	it( "keeps the path's own query parameters", () => {
		const url = new URL( calypsoLiveLink( '/setup/domain/domains?siteSlug=foo.blog' ) ?? '' );

		expect( url.pathname ).toBe( '/setup/domain/domains' );
		expect( url.searchParams.get( 'siteSlug' ) ).toBe( 'foo.blog' );
		expect( url.searchParams.get( 'image' ) ).toBe( IMAGE_REF );
	} );

	it( 'keeps a fragment, with the redirector params ahead of it', () => {
		const url = new URL( calypsoLiveLink( '/reader/blogs/1/posts/2#comment-3' ) ?? '' );

		expect( url.hash ).toBe( '#comment-3' );
		expect( url.searchParams.get( 'image' ) ).toBe( IMAGE_REF );
	} );

	it( 'lets the redirector params win over same-named params in the path', () => {
		const url = new URL( calypsoLiveLink( '/sites?env=classic', 'dashboard' ) ?? '' );

		expect( url.searchParams.getAll( 'env' ) ).toEqual( [ 'dashboard' ] );
	} );

	it( 'returns null for an absolute path pointing somewhere else', () => {
		expect( calypsoLiveLink( 'https://wordpress.com/plans' ) ).toBeNull();
	} );
} );
