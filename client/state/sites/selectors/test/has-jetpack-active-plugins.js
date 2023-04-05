import { hasJetpackActivePlugins } from 'calypso/state/sites/selectors';

describe( 'hasJetpackActivePlugins()', () => {
	test( 'should return true if plugins array has items', () => {
		const site = {
			ID: 2916288,
			options: {
				jetpack_connection_active_plugins: [ 'jetpack' ],
			},
		};

		const siteHasJetpackActivePlugins = hasJetpackActivePlugins( site );
		expect( siteHasJetpackActivePlugins ).toEqual( true );
	} );

	test( 'should return false if plugins array is empty', () => {
		const site = {
			ID: 2916288,
			options: {
				jetpack_connection_active_plugins: [],
			},
		};

		const siteHasJetpackActivePlugins = hasJetpackActivePlugins( site );
		expect( siteHasJetpackActivePlugins ).toEqual( false );
	} );

	test( 'should return false if plugins array does not exist', () => {
		const site = {
			ID: 2916288,
			options: {},
		};

		const siteHasJetpackActivePlugins = hasJetpackActivePlugins( site );
		expect( siteHasJetpackActivePlugins ).toEqual( false );
	} );
} );
