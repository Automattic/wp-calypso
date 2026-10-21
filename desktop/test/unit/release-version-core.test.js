const { isPrereleaseVersion } = require( '../../bin/github/release-version-core' );

describe( 'isPrereleaseVersion', () => {
	it.each( [ 'v8.2.3-beta.1', '8.2.3-beta.1', 'v8.2.0-beta.2', 'v10.0.0-rc.1' ] )(
		'flags %s as a prerelease',
		( version ) => {
			expect( isPrereleaseVersion( version ) ).toBe( true );
		}
	);

	it.each( [ 'v8.2.3', '8.2.3', 'v8.2.10', 'v10.0.0' ] )(
		'flags %s as a stable release',
		( version ) => {
			expect( isPrereleaseVersion( version ) ).toBe( false );
		}
	);
} );
