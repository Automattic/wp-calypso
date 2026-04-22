import { readerAtmosphereKeys } from '../query-keys';

describe( 'readerAtmosphereKeys', () => {
	it( 'stable keys', () => {
		expect( readerAtmosphereKeys.all ).toEqual( [ 'reader-atmosphere' ] );
		expect( readerAtmosphereKeys.connections() ).toEqual( [ 'reader-atmosphere', 'connections' ] );
		expect( readerAtmosphereKeys.verify( 101 ) ).toEqual( [ 'reader-atmosphere', 'verify', 101 ] );
	} );
} );
