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
		expect( isJetpackSite( getSiteState(), null ) ).toEqual( null );
		expect( isJetpackSite( getSiteState(), siteId + 1 ) ).toEqual( null );
	} );

	test( 'should return true for Atomic sites with Jetpack by default', () => {
		expect(
			isJetpackSite(
				getSiteState( {
					jetpack: true,
					options: {
						is_wpcom_atomic: true,
					},
				} ),
				siteId
			)
		).toEqual( true );
	} );

	test( 'should return false for Atomic sites without Jetpack', () => {
		expect(
			isJetpackSite(
				getSiteState( {
					jetpack: false,
					options: {
						is_wpcom_atomic: true,
					},
				} ),
				siteId
			)
		).toEqual( false );
	} );

	test( 'should return false for Atomic sites when treatAtomicAsJetpackSite is set to false', () => {
		expect(
			isJetpackSite(
				getSiteState( {
					jetpack: true,
					options: {
						is_wpcom_atomic: true,
					},
				} ),
				siteId,
				{ treatAtomicAsJetpackSite: false }
			)
		).toEqual( false );
	} );

	test( 'should return true if the site has the full Jetpack plugin installed', () => {
		expect(
			isJetpackSite(
				getSiteState( {
					jetpack: true,
					options: {
						is_wpcom_atomic: true,
					},
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

	test( 'should return false if the site has neither the full Jetpack plugin nor a standalone one', () => {
		expect(
			isJetpackSite(
				getSiteState( {
					jetpack: false,
					options: {
						jetpack_connection_active_plugins: [],
					},
				} ),
				siteId
			)
		).toEqual( false );
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
				{ considerStandaloneProducts: false }
			)
		).toEqual( false );
	} );
} );
