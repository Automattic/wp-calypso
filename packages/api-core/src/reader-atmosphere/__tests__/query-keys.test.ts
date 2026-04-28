import { readerAtmosphereKeys } from '../query-keys';

describe( 'readerAtmosphereKeys', () => {
	it( 'stable keys', () => {
		expect( readerAtmosphereKeys.all ).toEqual( [ 'reader', 'atmosphere' ] );
		expect( readerAtmosphereKeys.connections() ).toEqual( [
			'reader',
			'atmosphere',
			'connections',
		] );
		expect( readerAtmosphereKeys.connection( 42 ) ).toEqual( [
			'reader',
			'atmosphere',
			'connection',
			42,
		] );
	} );
} );
