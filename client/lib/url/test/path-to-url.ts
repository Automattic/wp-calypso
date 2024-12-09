import config from '@automattic/calypso-config';
import { pathToUrl } from '../path-to-url';

jest.mock( '@automattic/calypso-config', () => jest.fn() );

const mockConfig = config as unknown as jest.Mock;

describe( 'pathToUrl', () => {
	beforeEach( () => {
		mockConfig.mockReset();
	} );

	test( 'should return production URL', () => {
		mockConfig.mockImplementation( ( key: string ) => {
			switch ( key ) {
				case 'env':
					return 'production';
				case 'hostname':
					return 'wordpress.com';
				default:
					return undefined;
			}
		} );

		expect( pathToUrl( '/start' ) ).toBe( 'https://wordpress.com/start' );
	} );

	test( 'should return development URL', () => {
		mockConfig.mockImplementation( ( key: string ) => {
			switch ( key ) {
				case 'env':
					return 'development';
				case 'protocol':
					return 'http';
				case 'hostname':
					return 'calypso.localhost';
				case 'port':
					return '3000';
				default:
					return undefined;
			}
		} );

		expect( pathToUrl( '/start' ) ).toBe( 'http://calypso.localhost:3000/start' );
	} );
} );
