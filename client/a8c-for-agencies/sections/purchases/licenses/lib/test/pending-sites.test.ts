import { findPendingSiteIdByLicenseKey, hasProvisioningSite } from '../pending-sites';
import type { PendingSite } from '../pending-sites';

const pendingSite = ( id: number, license_key: string, state: string ): PendingSite => ( {
	id,
	features: { wpcom_atomic: { license_key, state } },
} );

describe( 'findPendingSiteIdByLicenseKey', () => {
	it( 'returns the id of the pending site behind the license', () => {
		const sites = [
			pendingSite( 1, 'wpcom-hosting-business_aaa', 'pending' ),
			pendingSite( 2, 'wpcom-hosting-business_bbb', 'pending' ),
		];

		expect( findPendingSiteIdByLicenseKey( sites, 'wpcom-hosting-business_bbb' ) ).toBe( 2 );
	} );

	it( 'ignores sites that are no longer pending', () => {
		const sites = [ pendingSite( 1, 'wpcom-hosting-business_aaa', 'provisioning' ) ];

		expect( findPendingSiteIdByLicenseKey( sites, 'wpcom-hosting-business_aaa' ) ).toBeNull();
	} );

	it( 'returns null when no site matches the license', () => {
		const sites = [ pendingSite( 1, 'wpcom-hosting-business_aaa', 'pending' ) ];

		expect( findPendingSiteIdByLicenseKey( sites, 'wpcom-hosting-business_zzz' ) ).toBeNull();
	} );

	it( 'returns null while pending sites are still loading', () => {
		expect( findPendingSiteIdByLicenseKey( undefined, 'wpcom-hosting-business_aaa' ) ).toBeNull();
	} );
} );

describe( 'hasProvisioningSite', () => {
	it( 'reports provisioning across any site, not just the one being looked at', () => {
		const sites = [
			pendingSite( 1, 'wpcom-hosting-business_aaa', 'pending' ),
			pendingSite( 2, 'wpcom-hosting-business_bbb', 'provisioning' ),
		];

		expect( hasProvisioningSite( sites ) ).toBe( true );
	} );

	it( 'is false when every site is still pending', () => {
		expect(
			hasProvisioningSite( [ pendingSite( 1, 'wpcom-hosting-business_aaa', 'pending' ) ] )
		).toBe( false );
	} );

	it( 'ignores provisioning sites without a license key', () => {
		expect( hasProvisioningSite( [ pendingSite( 1, '', 'provisioning' ) ] ) ).toBe( false );
	} );

	it( 'is false while pending sites are still loading', () => {
		expect( hasProvisioningSite( undefined ) ).toBe( false );
	} );
} );
