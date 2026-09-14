/**
 * @jest-environment jsdom
 */
import { detectPlatformAndArchitecture } from '../platform-detection';

describe( 'detectPlatformAndArchitecture', () => {
	const originalNavigator = global.navigator;

	afterEach( () => {
		// Restore original navigator
		Object.defineProperty( global, 'navigator', {
			value: originalNavigator,
			writable: true,
			configurable: true,
		} );
	} );

	describe( 'Client Hints API detection', () => {
		it( 'should detect Windows ARM64 via Client Hints', async () => {
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

			const result = await detectPlatformAndArchitecture();
			expect( result ).toEqual( {
				platform: 'windows',
				architecture: 'arm64',
				detectionMethod: 'client-hints',
			} );
		} );

		it( 'should detect Windows x64 via Client Hints', async () => {
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

			const result = await detectPlatformAndArchitecture();
			expect( result ).toEqual( {
				platform: 'windows',
				architecture: 'x64',
				detectionMethod: 'client-hints',
			} );
		} );

		it( 'should detect macOS ARM64 via Client Hints', async () => {
			const mockUserAgentData = {
				brands: [],
				mobile: false,
				platform: 'macOS',
				getHighEntropyValues: jest.fn().mockResolvedValue( {
					platform: 'macOS',
					architecture: 'arm64',
					bitness: '64',
				} ),
			};

			Object.defineProperty( global.navigator, 'userAgentData', {
				value: mockUserAgentData,
				writable: true,
				configurable: true,
			} );

			const result = await detectPlatformAndArchitecture();
			expect( result ).toEqual( {
				platform: 'macos',
				architecture: 'arm64',
				detectionMethod: 'client-hints',
			} );
		} );

		it( 'should detect macOS x64 via Client Hints', async () => {
			const mockUserAgentData = {
				brands: [],
				mobile: false,
				platform: 'macOS',
				getHighEntropyValues: jest.fn().mockResolvedValue( {
					platform: 'macOS',
					architecture: 'x86',
					bitness: '64',
				} ),
			};

			Object.defineProperty( global.navigator, 'userAgentData', {
				value: mockUserAgentData,
				writable: true,
				configurable: true,
			} );

			const result = await detectPlatformAndArchitecture();
			expect( result ).toEqual( {
				platform: 'macos',
				architecture: 'x64',
				detectionMethod: 'client-hints',
			} );
		} );

		it( 'should detect Linux via Client Hints', async () => {
			const mockUserAgentData = {
				brands: [],
				mobile: false,
				platform: 'Linux',
				getHighEntropyValues: jest.fn().mockResolvedValue( {
					platform: 'Linux',
					architecture: 'x86',
					bitness: '64',
				} ),
			};

			Object.defineProperty( global.navigator, 'userAgentData', {
				value: mockUserAgentData,
				writable: true,
				configurable: true,
			} );

			const result = await detectPlatformAndArchitecture();
			expect( result ).toEqual( {
				platform: 'linux',
				architecture: 'x64',
				detectionMethod: 'client-hints',
			} );
		} );
	} );

	describe( 'navigator.platform fallback', () => {
		it( 'should fallback to navigator.platform for macOS', async () => {
			Object.defineProperty( global.navigator, 'userAgentData', {
				value: undefined,
				writable: true,
				configurable: true,
			} );

			Object.defineProperty( global.navigator, 'platform', {
				value: 'MacIntel',
				writable: true,
				configurable: true,
			} );

			const result = await detectPlatformAndArchitecture();
			expect( result ).toEqual( {
				platform: 'macos',
				architecture: undefined,
				detectionMethod: 'navigator-platform',
			} );
		} );

		it( 'should fallback to navigator.platform for Windows', async () => {
			Object.defineProperty( global.navigator, 'userAgentData', {
				value: undefined,
				writable: true,
				configurable: true,
			} );

			Object.defineProperty( global.navigator, 'platform', {
				value: 'Win32',
				writable: true,
				configurable: true,
			} );

			const result = await detectPlatformAndArchitecture();
			expect( result ).toEqual( {
				platform: 'windows',
				architecture: undefined,
				detectionMethod: 'navigator-platform',
			} );
		} );

		it( 'should fallback to navigator.platform for Linux', async () => {
			Object.defineProperty( global.navigator, 'userAgentData', {
				value: undefined,
				writable: true,
				configurable: true,
			} );

			Object.defineProperty( global.navigator, 'platform', {
				value: 'Linux x86_64',
				writable: true,
				configurable: true,
			} );

			const result = await detectPlatformAndArchitecture();
			expect( result ).toEqual( {
				platform: 'linux',
				architecture: undefined,
				detectionMethod: 'navigator-platform',
			} );
		} );
	} );

	describe( 'Error handling', () => {
		it( 'should fallback to navigator.platform when Client Hints throws error', async () => {
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

			Object.defineProperty( global.navigator, 'platform', {
				value: 'Win32',
				writable: true,
				configurable: true,
			} );

			const result = await detectPlatformAndArchitecture();
			expect( result ).toEqual( {
				platform: 'windows',
				architecture: undefined,
				detectionMethod: 'navigator-platform',
			} );
			expect( consoleWarnSpy ).toHaveBeenCalledWith(
				'Failed to get high entropy values:',
				mockError
			);

			consoleWarnSpy.mockRestore();
		} );

		it( 'should return null when no detection method works', async () => {
			Object.defineProperty( global.navigator, 'userAgentData', {
				value: undefined,
				writable: true,
				configurable: true,
			} );

			Object.defineProperty( global.navigator, 'platform', {
				value: 'Unknown Platform',
				writable: true,
				configurable: true,
			} );

			const result = await detectPlatformAndArchitecture();
			expect( result ).toBeNull();
		} );
	} );
} );
