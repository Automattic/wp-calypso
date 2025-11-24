/**
 * @jest-environment jsdom
 */
import { getWindowsArchitecture } from './platform-detection';

describe( 'getWindowsArchitecture', () => {
	const originalNavigator = global.navigator;

	afterEach( () => {
		// Restore original navigator
		Object.defineProperty( global, 'navigator', {
			value: originalNavigator,
			writable: true,
			configurable: true,
		} );
	} );

	it( 'should return "arm64" when architecture is "arm"', async () => {
		const mockUserAgentData = {
			brands: [],
			mobile: false,
			platform: 'Windows',
			getHighEntropyValues: jest.fn().mockResolvedValue( {
				platform: 'Windows',
				architecture: 'arm',
				bitness: '64',
			} ),
		};

		Object.defineProperty( global.navigator, 'userAgentData', {
			value: mockUserAgentData,
			writable: true,
			configurable: true,
		} );

		const result = await getWindowsArchitecture();
		expect( result ).toBe( 'arm64' );
		expect( mockUserAgentData.getHighEntropyValues ).toHaveBeenCalledWith( [
			'architecture',
			'bitness',
			'platform',
		] );
	} );

	it( 'should return "arm64" when architecture is "arm64"', async () => {
		const mockUserAgentData = {
			brands: [],
			mobile: false,
			platform: 'Windows',
			getHighEntropyValues: jest.fn().mockResolvedValue( {
				platform: 'Windows',
				architecture: 'arm64',
				bitness: '64',
			} ),
		};

		Object.defineProperty( global.navigator, 'userAgentData', {
			value: mockUserAgentData,
			writable: true,
			configurable: true,
		} );

		const result = await getWindowsArchitecture();
		expect( result ).toBe( 'arm64' );
	} );

	it( 'should return "x64" when architecture is "x86" and bitness is "64"', async () => {
		const mockUserAgentData = {
			brands: [],
			mobile: false,
			platform: 'Windows',
			getHighEntropyValues: jest.fn().mockResolvedValue( {
				platform: 'Windows',
				architecture: 'x86',
				bitness: '64',
			} ),
		};

		Object.defineProperty( global.navigator, 'userAgentData', {
			value: mockUserAgentData,
			writable: true,
			configurable: true,
		} );

		const result = await getWindowsArchitecture();
		expect( result ).toBe( 'x64' );
	} );

	it( 'should return "x64" as default when architecture is present but does not match ARM', async () => {
		const mockUserAgentData = {
			brands: [],
			mobile: false,
			platform: 'Windows',
			getHighEntropyValues: jest.fn().mockResolvedValue( {
				platform: 'Windows',
				architecture: 'unknown',
				bitness: '64',
			} ),
		};

		Object.defineProperty( global.navigator, 'userAgentData', {
			value: mockUserAgentData,
			writable: true,
			configurable: true,
		} );

		const result = await getWindowsArchitecture();
		expect( result ).toBe( 'x64' );
	} );

	it( 'should return null when architecture is not present', async () => {
		const mockUserAgentData = {
			brands: [],
			mobile: false,
			platform: 'Windows',
			getHighEntropyValues: jest.fn().mockResolvedValue( {
				platform: 'Windows',
				bitness: '64',
			} ),
		};

		Object.defineProperty( global.navigator, 'userAgentData', {
			value: mockUserAgentData,
			writable: true,
			configurable: true,
		} );

		const result = await getWindowsArchitecture();
		expect( result ).toBeNull();
	} );

	it( 'should return null when userAgentData is not available', async () => {
		Object.defineProperty( global.navigator, 'userAgentData', {
			value: undefined,
			writable: true,
			configurable: true,
		} );

		const result = await getWindowsArchitecture();
		expect( result ).toBeNull();
	} );

	it( 'should return null and log warning when getHighEntropyValues throws an error', async () => {
		const consoleWarnSpy = jest.spyOn( console, 'warn' ).mockImplementation();
		const mockError = new Error( 'Permission denied' );

		const mockUserAgentData = {
			brands: [],
			mobile: false,
			platform: 'Windows',
			getHighEntropyValues: jest.fn().mockRejectedValue( mockError ),
		};

		Object.defineProperty( global.navigator, 'userAgentData', {
			value: mockUserAgentData,
			writable: true,
			configurable: true,
		} );

		const result = await getWindowsArchitecture();
		expect( result ).toBeNull();
		expect( consoleWarnSpy ).toHaveBeenCalledWith(
			'Failed to get high entropy values:',
			mockError
		);

		consoleWarnSpy.mockRestore();
	} );
} );
