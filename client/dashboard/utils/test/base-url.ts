import { buildLinkFromBaseUrl } from '../base-url';

describe( 'buildLinkFromBaseUrl', () => {
	it( 'resolves a path against a plain base URL', () => {
		expect( buildLinkFromBaseUrl( '/domains/add/foo.blog', 'https://wordpress.com' ) ).toBe(
			'https://wordpress.com/domains/add/foo.blog'
		);
	} );

	it( "keeps the base URL's query parameters", () => {
		const link = buildLinkFromBaseUrl(
			'/domains/add/foo.blog',
			'https://calypso.live/?image=registry.a8c.com%2Fcalypso%2Fapp%3Acommit-abc&env=dashboard'
		);

		const url = new URL( link );
		expect( url.origin + url.pathname ).toBe( 'https://calypso.live/domains/add/foo.blog' );
		expect( url.searchParams.get( 'image' ) ).toBe( 'registry.a8c.com/calypso/app:commit-abc' );
		expect( url.searchParams.get( 'env' ) ).toBe( 'dashboard' );
	} );

	it( "merges the path's own query parameters with the base URL's", () => {
		const url = new URL(
			buildLinkFromBaseUrl(
				'/setup/domain/domains?siteSlug=foo.blog',
				'https://calypso.live/?image=app%3Acommit-abc'
			)
		);

		expect( url.pathname ).toBe( '/setup/domain/domains' );
		expect( url.searchParams.get( 'siteSlug' ) ).toBe( 'foo.blog' );
		expect( url.searchParams.get( 'image' ) ).toBe( 'app:commit-abc' );
	} );

	it( 'lets the path win over the base URL on conflicting parameters', () => {
		const url = new URL(
			buildLinkFromBaseUrl( '/sites?env=classic', 'https://calypso.live/?env=dashboard' )
		);

		expect( url.searchParams.getAll( 'env' ) ).toEqual( [ 'classic' ] );
	} );
} );
