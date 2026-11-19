import { vi } from 'vitest';
import { getApiPath } from '../get-api';

const config = {
	isEnabled: vi.fn(),
};

describe( 'getApiPath for jetpack/atomic sites', () => {
	beforeAll( () => {
		config.isEnabled.mockReturnValue( true );
	} );
	afterAll( () => {
		vi.clearAllMocks();
	} );
	it( 'should return the passed in jetpackPath', () => {
		config.isEnabled.mockReturnValue( true );
		const jetpackPath = '/jetpack-api';
		const params = { siteId: 123 };

		const result = getApiPath( jetpackPath, params );

		expect( result ).toBe( jetpackPath );
	} );
} );

describe( 'getApiPath for simple sites', () => {
	beforeAll( () => {
		config.isEnabled.mockReturnValue( false );
	} );
	afterAll( () => {
		vi.clearAllMocks();
	} );
	it( '/site/purchases', () => {
		const jetpackPath = '/site/purchases';
		const params = { siteId: 123 };

		const result = getApiPath( jetpackPath, params );

		expect( result ).toBe( `/sites/${ params.siteId }/purchases` );
	} );

	it( '/site', () => {
		const jetpackPath = '/site';
		const params = { siteId: 123 };

		const result = getApiPath( jetpackPath, params );

		expect( result ).toBe( `/sites/${ params.siteId }` );
	} );
} );
