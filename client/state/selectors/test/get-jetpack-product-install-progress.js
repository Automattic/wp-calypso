/**
 * Internal dependencies
 */
import getJetpackProductInstallProgress from 'calypso/state/selectors/get-jetpack-product-install-progress';

describe( '#getJetpackProductInstallProgress', () => {
	const siteId = 12345678;

	test( "should return `null` when we don't have the product installation progress for this site", () => {
		expect( getJetpackProductInstallProgress( {}, siteId ) ).toBeNull();
	} );

	test( 'should return the product installation progress when we have it for this site', () => {
		const state = {
			jetpackProductInstall: {
				[ siteId ]: {
					akismet_status: 'key_not_set',
					progress: 60,
					vaultpress_status: 'key_not_set',
				},
			},
		};
		expect( getJetpackProductInstallProgress( state, siteId ) ).toEqual( 60 );
	} );
} );
