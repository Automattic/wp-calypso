import isSiteUpgradeable from 'calypso/state/selectors/is-site-upgradeable';

describe( 'isSiteUpgradeable()', () => {
	test( 'should return null if no siteId is given', () => {
		const isUpgradeable = isSiteUpgradeable( { currentUser: { capabilities: {} } }, null );
		expect( isUpgradeable ).toBeNull();
	} );

	test( 'should return null if there is no site with that siteId', () => {
		const isUpgradeable = isSiteUpgradeable( { currentUser: { capabilities: {} } }, 42 );
		expect( isUpgradeable ).toBeNull();
	} );

	test( 'should return false if the user cannot manage the site', () => {
		const isUpgradeable = isSiteUpgradeable(
			{
				currentUser: {
					capabilities: {
						77203199: {
							manage_options: false,
						},
					},
				},
			},
			77203199
		);

		expect( isUpgradeable ).toBe( false );
	} );

	test( 'should return true if the user can manage the site', () => {
		const isUpgradeable = isSiteUpgradeable(
			{
				currentUser: {
					capabilities: {
						77203199: {
							manage_options: true,
						},
					},
				},
			},
			77203199
		);

		expect( isUpgradeable ).toBe( true );
	} );
} );
