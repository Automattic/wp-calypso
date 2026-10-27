import { getLaunchpadDestination } from '../index';

describe( 'getLaunchpadDestination', () => {
	const adminUrl = 'https://example.com/wp-admin/';

	it( 'returns null for sites without a launchpad option (caller falls through)', () => {
		expect( getLaunchpadDestination( {}, adminUrl ) ).toBeNull();
		expect( getLaunchpadDestination( undefined, adminUrl ) ).toBeNull();
	} );

	it( 'sends AI Launchpad sites to Site Setup', () => {
		expect( getLaunchpadDestination( { wpcom_ai_launchpad_enabled: true }, adminUrl ) ).toBe(
			'https://example.com/wp-admin/admin.php?page=site-setup-wp-admin'
		);
	} );

	it( 'sends skipped AI Launchpad sites to the wp-admin dashboard', () => {
		expect(
			getLaunchpadDestination(
				{ wpcom_ai_launchpad_enabled: true, wpcom_ai_launchpad_dismissed: true },
				adminUrl
			)
		).toBe( 'https://example.com/wp-admin/' );
	} );

	it( 'sends no-guidance sites to the wp-admin dashboard', () => {
		expect( getLaunchpadDestination( { wpcom_ai_launchpad_no_guidance: true }, adminUrl ) ).toBe(
			'https://example.com/wp-admin/'
		);
	} );

	it( 'sends no-guidance sites to the wp-admin dashboard, even when enabled is set', () => {
		expect(
			getLaunchpadDestination(
				{ wpcom_ai_launchpad_enabled: true, wpcom_ai_launchpad_no_guidance: true },
				adminUrl
			)
		).toBe( 'https://example.com/wp-admin/' );
	} );
} );
