import { LicenseState } from '../../types';
import getLicenseState from '../get-license-state';

describe( 'getLicenseState', () => {
	it( 'returns Revoked if revokedAt is non-empty', () => {
		expect( getLicenseState( 'any non-empty string', 'whatever' ) ).toBe( LicenseState.Revoked );
		expect( getLicenseState( null, 'space' ) ).toBe( LicenseState.Revoked );
	} );

	it( 'returns Attached if revokedAt is null but attachedAt is non-empty', () => {
		expect( getLicenseState( 'xyzzy', null ) ).toBe( LicenseState.Attached );
	} );

	it( 'returns Detached if both revokedAt and attachedAt are empty or null', () => {
		expect( getLicenseState( null, null ) ).toBe( LicenseState.Detached );
		expect( getLicenseState( null, '' ) ).toBe( LicenseState.Detached );
		expect( getLicenseState( '', null ) ).toBe( LicenseState.Detached );
		expect( getLicenseState( '', '' ) ).toBe( LicenseState.Detached );
	} );
} );
