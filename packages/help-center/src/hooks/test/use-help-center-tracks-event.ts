import { getHelpCenterTracksProperties } from '../use-help-center-tracks-event';

describe( 'getHelpCenterTracksProperties', () => {
	test( 'uses site explicitly selected for support flow', () => {
		expect(
			getHelpCenterTracksProperties( { source: 'odie' }, { explicitSiteId: 11, siteId: 22 } )
		).toEqual( { source: 'odie', blog_id: 11, site_context_source: 'explicit' } );
	} );

	test( 'falls back to the Help Center context site when the explicit site is invalid', () => {
		expect(
			getHelpCenterTracksProperties( { source: 'odie' }, { explicitSiteId: 0, siteId: 22 } )
		).toEqual( { source: 'odie', blog_id: 22, site_context_source: 'help_center_context' } );
	} );

	test( 'uses Help Center context site', () => {
		expect( getHelpCenterTracksProperties( {}, { siteId: 22 } ) ).toEqual( {
			blog_id: 22,
			site_context_source: 'help_center_context',
		} );
	} );

	test( 'reports no site when the Help Center has none', () => {
		expect( getHelpCenterTracksProperties( {}, {} ) ).toEqual( { site_context_source: 'none' } );
	} );

	test( 'never lets a caller blog_id stand in for the support site', () => {
		expect(
			getHelpCenterTracksProperties( { blog_id: 44, source: 'article' }, { siteId: 22 } )
		).toEqual( { blog_id: 22, source: 'article', site_context_source: 'help_center_context' } );
		expect( getHelpCenterTracksProperties( { blog_id: 44, source: 'article' } ) ).toEqual( {
			source: 'article',
			site_context_source: 'none',
		} );
	} );

	test( 'preserves caller properties other than blog_id', () => {
		expect(
			getHelpCenterTracksProperties( { source: 'article', post_id: 7 }, { siteId: 22 } )
		).toEqual( {
			source: 'article',
			post_id: 7,
			blog_id: 22,
			site_context_source: 'help_center_context',
		} );
	} );

	test( 'replaces an invalid caller blog_id with valid site context', () => {
		expect( getHelpCenterTracksProperties( { blog_id: 0 }, { siteId: 22 } ) ).toEqual( {
			blog_id: 22,
			site_context_source: 'help_center_context',
		} );
	} );

	test( 'omits blog_id when no valid site exists', () => {
		expect(
			getHelpCenterTracksProperties( { blog_id: Number.NaN, source: 'global' }, { siteId: null } )
		).toEqual( { source: 'global', site_context_source: 'none' } );
	} );
} );
