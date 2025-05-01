import { isAndroid, isDesktop, isIos, isMobile, isTablet } from '..';
import getDeviceType from '../get-device-type';
import getOsName from '../get-os-name';

jest.mock( '../get-os-name', () => jest.fn() );
jest.mock( '../get-device-type', () => jest.fn() );

describe( 'user-agent', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	describe( 'isAndroid', () => {
		it( 'should return true when OS is Android', () => {
			( getOsName as unknown as jest.Mock ).mockReturnValue( 'Android' );
			expect( isAndroid() ).toBe( true );
		} );

		it( 'should return false when OS is not Android', () => {
			( getOsName as unknown as jest.Mock ).mockReturnValue( 'iOS' );
			expect( isAndroid() ).toBe( false );
		} );
	} );

	describe( 'isIos', () => {
		it( 'should return true when OS is iOS', () => {
			( getOsName as unknown as jest.Mock ).mockReturnValue( 'iOS' );
			expect( isIos() ).toBe( true );
		} );

		it( 'should return false when OS is not iOS', () => {
			( getOsName as unknown as jest.Mock ).mockReturnValue( 'Android' );
			expect( isIos() ).toBe( false );
		} );
	} );

	describe( 'isMobile', () => {
		it( 'should return true when device type is mobile', () => {
			( getDeviceType as unknown as jest.Mock ).mockReturnValue( 'mobile' );
			expect( isMobile() ).toBe( true );
		} );

		it( 'should return false when device type is not mobile', () => {
			( getDeviceType as unknown as jest.Mock ).mockReturnValue( 'tablet' );
			expect( isMobile() ).toBe( false );
		} );

		it( 'should return false when device type is undefined', () => {
			( getDeviceType as unknown as jest.Mock ).mockReturnValue( undefined );
			expect( isMobile() ).toBe( false );
		} );
	} );

	describe( 'isTablet', () => {
		it( 'should return true when device type is tablet', () => {
			( getDeviceType as unknown as jest.Mock ).mockReturnValue( 'tablet' );
			expect( isTablet() ).toBe( true );
		} );

		it( 'should return false when device type is not tablet', () => {
			( getDeviceType as unknown as jest.Mock ).mockReturnValue( 'mobile' );
			expect( isTablet() ).toBe( false );
		} );

		it( 'should return false when device type is undefined', () => {
			( getDeviceType as unknown as jest.Mock ).mockReturnValue( undefined );
			expect( isTablet() ).toBe( false );
		} );
	} );

	describe( 'isDesktop', () => {
		it( 'should return true when device type is undefined', () => {
			( getDeviceType as unknown as jest.Mock ).mockReturnValue( undefined );
			expect( isDesktop() ).toBe( true );
		} );

		it( 'should return false when device type is mobile', () => {
			( getDeviceType as unknown as jest.Mock ).mockReturnValue( 'mobile' );
			expect( isDesktop() ).toBe( false );
		} );

		it( 'should return false when device type is tablet', () => {
			( getDeviceType as unknown as jest.Mock ).mockReturnValue( 'tablet' );
			expect( isDesktop() ).toBe( false );
		} );
	} );
} );
