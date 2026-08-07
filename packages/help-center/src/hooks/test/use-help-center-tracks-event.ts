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

	test( 'preserves a valid caller blog_id and other properties', () => {
		expect(
			getHelpCenterTracksProperties( { blog_id: 44, source: 'article' }, { siteId: 22 } )
		).toEqual( { blog_id: 44, source: 'article' } );
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
