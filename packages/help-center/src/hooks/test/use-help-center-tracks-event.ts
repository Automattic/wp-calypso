import { getHelpCenterTracksProperties } from '../use-help-center-tracks-event';

describe( 'getHelpCenterTracksProperties', () => {
	test( 'uses site explicitly selected for support flow', () => {
		expect(
			getHelpCenterTracksProperties(
				{ source: 'odie' },
				{ explicitSiteId: 11, siteId: 22, primarySiteId: 33, usePrimarySiteId: true }
			)
		).toEqual( { source: 'odie', blog_id: 11 } );
	} );

	test( 'uses Help Center context site', () => {
		expect( getHelpCenterTracksProperties( {}, { siteId: 22 } ) ).toEqual( { blog_id: 22 } );
	} );

	test( 'uses primary site only when enabled', () => {
		expect(
			getHelpCenterTracksProperties( {}, { primarySiteId: 33, usePrimarySiteId: true } )
		).toEqual( { blog_id: 33 } );
		expect( getHelpCenterTracksProperties( {}, { primarySiteId: 33 } ) ).toEqual( {} );
	} );

	test( 'never lets a caller blog_id stand in for the support site', () => {
		// A blog_id in the payload means whatever the caller put there — a search result's
		// own blog, say — which is not the site the support session is about.
		expect(
			getHelpCenterTracksProperties( { blog_id: 44, source: 'article' }, { siteId: 22 } )
		).toEqual( { blog_id: 22, source: 'article' } );
		expect( getHelpCenterTracksProperties( { blog_id: 44, source: 'article' } ) ).toEqual( {
			source: 'article',
		} );
	} );

	test( 'preserves caller properties other than blog_id', () => {
		expect(
			getHelpCenterTracksProperties( { source: 'article', post_id: 7 }, { siteId: 22 } )
		).toEqual( { source: 'article', post_id: 7, blog_id: 22 } );
	} );

	test( 'replaces an invalid caller blog_id with valid site context', () => {
		expect( getHelpCenterTracksProperties( { blog_id: 0 }, { siteId: 22 } ) ).toEqual( {
			blog_id: 22,
		} );
	} );

	test( 'omits blog_id when no valid site exists', () => {
		expect(
			getHelpCenterTracksProperties( { blog_id: Number.NaN, source: 'global' }, { siteId: null } )
		).toEqual( { source: 'global' } );
	} );
} );
