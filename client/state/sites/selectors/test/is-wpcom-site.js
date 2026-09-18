import isWpcomSite from 'calypso/state/sites/selectors/is-wpcom-site';

const emptyState = { sites: { items: {} }, ui: { selectedSiteId: null } };

const stateWithSite = ( site ) => ( {
	sites: { items: { [ site.ID ]: site } },
	ui: { selectedSiteId: null },
} );

describe( 'isWpcomSite()', () => {
	test( 'should return false for a self-hosted Jetpack site', () => {
		const state = stateWithSite( { ID: 1, URL: 'https://selfhosted.blog', jetpack: true } );

		expect( isWpcomSite( state, 1 ) ).toBe( false );
	} );

	test( 'should return true for a Simple site', () => {
		const state = stateWithSite( { ID: 2, URL: 'https://simple.wordpress.com', jetpack: false } );

		expect( isWpcomSite( state, 2 ) ).toBe( true );
	} );

	test( 'should return true for an Atomic site', () => {
		const state = stateWithSite( {
			ID: 3,
			URL: 'https://atomic.blog',
			jetpack: true,
			is_wpcom_atomic: true,
		} );

		expect( isWpcomSite( state, 3 ) ).toBe( true );
	} );

	// `isSimpleSite` is false for an Atomic site both before and after the site
	// lands in state, so it cannot be the only cache dependant: the memoized
	// `false` from the first call would never be invalidated.
	test( 'should recompute for an Atomic site that loads after the first call', () => {
		const atomicSite = {
			ID: 4,
			URL: 'https://atomic-later.blog',
			jetpack: true,
			is_wpcom_atomic: true,
		};

		expect( isWpcomSite( emptyState, 4 ) ).toBe( false );
		expect( isWpcomSite( stateWithSite( atomicSite ), 4 ) ).toBe( true );
	} );
} );
