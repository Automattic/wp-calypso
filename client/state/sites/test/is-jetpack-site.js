import isJetpackSite from '../selectors/is-jetpack-site';

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

describe( 'isJetpackSite', () => {
	test( 'should return null if no site is found', () => {
		expect( isJetpackSite( getSiteState() ) ).toEqual( null );
		expect( isJetpackSite( getSiteState(), siteId + 1 ) ).toEqual( null );
	} );

	test( 'should return false if the site is hosted on WordPress.com, even if a product plugin is installed', () => {
		expect( isJetpackSite( getSiteState( { jetpack: false } ), siteId ) ).toEqual( false );
		expect(
			isJetpackSite(
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

	test( 'should return true if the site has the full Jetpack plugin installed', () => {
		expect(
			isJetpackSite(
				getSiteState( {
					jetpack: true,
				} ),
				siteId
			)
		).toEqual( true );
	} );

	test( 'should return true if the site has full and a standalone Jetpack plugin installed', () => {
		expect(
			isJetpackSite(
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
			isJetpackSite(
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

	test( 'should return false if the site has a standalone Jetpack plugin installed, but not the full plugin with considerStandaloneProducts set to false', () => {
		expect(
			isJetpackSite(
				getSiteState( {
					jetpack: false,
					options: {
						jetpack_connection_active_plugins: [ 'jetpack-backup' ],
					},
				} ),
				siteId,
				false
			)
		).toEqual( false );
	} );
} );
