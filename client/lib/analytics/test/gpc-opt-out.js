/**
 * @jest-environment jsdom
 */
import { mayWeTrackUserGpcInCCPARegion, isGpcFlagSetOptOut } from '../utils';
import isRegionInCcpaZone from '../utils/is-region-in-ccpa-zone';

// Return a predictable value for whether the user is in a CCPA region.
jest.mock( '../utils/is-region-in-ccpa-zone' );

let windowSpy = jest.SpyInstance;

// Return a predictable value for window.navigator.globalPrivacyControl.
const setMockGPCValue = ( gpcValue ) => {
	windowSpy.mockImplementation( () => ( {
		navigator: {
			globalPrivacyControl: gpcValue,
		},
	} ) );
};

describe( 'global privacy control', () => {
	beforeEach( () => {
		windowSpy = jest.spyOn( global, 'window', 'get' );
	} );

	afterEach( () => {
		windowSpy.mockRestore();
	} );

	describe( 'mayWeTrackUserGpcInCCPARegion', () => {
		test( 'we may track a user in CCPA if GPC is not set', () => {
			setMockGPCValue( undefined );
			isRegionInCcpaZone.mockReturnValue( true );

			expect( mayWeTrackUserGpcInCCPARegion() ).toBe( true );
		} );

		test( 'we may track a user in CCPA if GPC is set to false', () => {
			setMockGPCValue( false );
			isRegionInCcpaZone.mockReturnValue( true );

			expect( mayWeTrackUserGpcInCCPARegion() ).toBe( true );
		} );

		test( 'we may not track a user in CCPA if GPC is set', () => {
			setMockGPCValue( true );
			isRegionInCcpaZone.mockReturnValue( true );

			expect( mayWeTrackUserGpcInCCPARegion() ).toBe( false );
		} );

		test( 'we may track a user outside CCPA if GPC is set', () => {
			setMockGPCValue( true );
			isRegionInCcpaZone.mockReturnValue( false );

			expect( mayWeTrackUserGpcInCCPARegion() ).toBe( true );
		} );

		test( 'we may track a user outside CCPA if GPC is undefined', () => {
			setMockGPCValue( undefined );
			isRegionInCcpaZone.mockReturnValue( false );

			expect( mayWeTrackUserGpcInCCPARegion() ).toBe( true );
		} );
	} );

	describe( 'isGpcFlagSetOptOut', () => {
		test( 'if GPC is set to true in browser, return true', () => {
			setMockGPCValue( true );
			expect( mayWeTrackUserGpcInCCPARegion() ).toBe( true );
		} );

		test( 'if GPC is set to false in browser, return false', () => {
			setMockGPCValue( false );
			expect( isGpcFlagSetOptOut() ).toBe( false );
		} );

		test( 'if GPC is undefined in browser, return false', () => {
			setMockGPCValue( undefined );
			expect( isGpcFlagSetOptOut() ).toBe( false );
		} );
	} );
} );
