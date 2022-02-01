import isJetpackProductSite from '../selectors/is-jetpack-product-site';

const siteId = 1;
const getSiteState = ( siteData = {} ) => {
	return {
		sites: {
			items: {
				[ siteId ]: {
					ID: siteId,
					...siteData,
				},
			},
		},
	};
};

describe( 'isJetpackProductSite', () => {
	test( 'should return null if no site is found', () => {
		expect( isJetpackProductSite( getSiteState() ) ).toEqual( null );
		expect( isJetpackProductSite( getSiteState(), siteId + 1 ) ).toEqual( null );
	} );

	test( 'should return false if the site is hosted on WordPress.com, even if a product plugin is installed', () => {
		expect( isJetpackProductSite( getSiteState( { jetpack: false } ), siteId ) ).toEqual( false );
		expect(
			isJetpackProductSite(
				getSiteState( {
					options: {
						is_automated_transfer: true,
						jetpack_connection_active_plugins: [ 'jetpack-backup' ],
					},
				} ),
				siteId
			)
		).toEqual( false );
	} );

	test( 'should return false if the site has the full Jetpack plugin installed', () => {
		expect(
			isJetpackProductSite(
				getSiteState( {
					jetpack: true,
					options: {
						jetpack_connection_active_plugins: [ 'jetpack' ],
					},
				} ),
				siteId
			)
		).toEqual( false );
	} );

	test( 'should return true if the site has a standalone Jetpack plugin installed', () => {
		expect(
			isJetpackProductSite(
				getSiteState( {
					jetpack: true,
					options: {
						jetpack_connection_active_plugins: [ 'jetpack-backup' ],
					},
				} ),
				siteId
			)
		).toEqual( true );
	} );

	test( 'should return true if the site has a standalone Jetpack plugin installed, but not the full plugin', () => {
		expect(
			isJetpackProductSite(
				getSiteState( {
					jetpack: false,
					options: {
						jetpack_connection_active_plugins: [ 'jetpack-backup' ],
					},
				} ),
				siteId
			)
		).toEqual( true );
	} );
} );
