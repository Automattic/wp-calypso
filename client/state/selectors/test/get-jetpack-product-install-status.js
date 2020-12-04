/**
 * Internal dependencies
 */
import getJetpackProductInstallStatus from 'calypso/state/selectors/get-jetpack-product-install-status';

describe( '#getJetpackProductInstallStatus', () => {
	const siteId = 12345678;

	test( "should return `null` when we don't have the product installation status for this site", () => {
		expect( getJetpackProductInstallStatus( {}, siteId ) ).toBeNull();
	} );

	test( 'should return the product installation status when we have it for this site', () => {
		const status = {
			akismet_status: 'installed',
			progress: 100,
			vaultpress_status: 'installed',
		};
		const state = {
			jetpackProductInstall: {
				[ siteId ]: {
					...status,
				},
			},
		};
		expect( getJetpackProductInstallStatus( state, siteId ) ).toEqual( status );
	} );
} );
