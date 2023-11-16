import areLicenseKeysAssignableToMultisite from '../are-license-keys-assignable-to-multisite';

describe( 'areLicenseKeysAssignableToMultisite', () => {
	it.each( [
		[ [ 'jetpack-backup-twinkletwinkle' ] ],
		[ [ 'jetpack-scan-littlestar' ] ],
		[ [ 'jetpack-backup', 'jetpack-scan' ] ],
	] )( 'returns false if only Jetpack Backup or Jetpack Scan keys are present', ( input ) => {
		expect( areLicenseKeysAssignableToMultisite( input ) ).toBe( false );
	} );

	it.each( [
		[ [ 'jetpack-backup', 'jetpack-blahblah', 'jetpack-scan-doremi' ] ],
		[ [ 'jetpack-foobar', 'jetpack-backup-lalala' ] ],
		[ [ 'jetpack-scan-dobeedo', 'jetpack-testingkeyhere' ] ],
		[ [ 'fakething', 'whatever', 'ohai' ] ],
	] )( 'returns true if any non-Jetpack Backup/Scan keys are present', ( input ) => {
		expect( areLicenseKeysAssignableToMultisite( input ) ).toBe( true );
	} );
} );
