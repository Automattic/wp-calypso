import { chooseInstallStrategy } from '../install-strategy';

describe( 'chooseInstallStrategy', () => {
	it.each( [
		// siteInstallsInPlace, siteCanTransferToAtomic, expected
		[ true, true, 'in-place' ],
		[ true, false, 'in-place' ],
		[ false, true, 'atomic-transfer' ],
		[ false, false, 'none' ],
	] as const )(
		'installsInPlace=%s, canTransfer=%s -> %s',
		( siteInstallsInPlace, siteCanTransferToAtomic, expected ) => {
			expect( chooseInstallStrategy( { siteInstallsInPlace, siteCanTransferToAtomic } ) ).toBe(
				expected
			);
		}
	);

	it( 'prefers installing in place over transferring to Atomic', () => {
		expect(
			chooseInstallStrategy( { siteInstallsInPlace: true, siteCanTransferToAtomic: true } )
		).toBe( 'in-place' );
	} );
} );
