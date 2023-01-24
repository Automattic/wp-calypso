/**
 * @jest-environment jsdom
 */
import { mayWeTrackUserGpcInCcpaRegion } from '../utils';
import isRegionInCcpaZone from '../utils/is-region-in-ccpa-zone';

// Return a predictable value for whether the user is in a CCPA region.
jest.mock( '../utils/is-region-in-ccpa-zone' );

let windowSpy = jest.SpyInstance;

// Return a predictable value for window.navigator.globalPrivacyControl.
const setMockGpcValue = ( gpcValue ) => {
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

	describe( 'mayWeTrackUserGpcInCcpaRegion', () => {
		test( 'we may track a user in CCPA if GPC is not set', () => {
			setMockGpcValue( undefined );
			isRegionInCcpaZone.mockReturnValue( true );

			expect( mayWeTrackUserGpcInCcpaRegion() ).toBe( true );
		} );

		test( 'we may track a user in CCPA if GPC is set to false', () => {
			setMockGpcValue( false );
			isRegionInCcpaZone.mockReturnValue( true );

			expect( mayWeTrackUserGpcInCcpaRegion() ).toBe( true );
		} );

		test( 'we may not track a user in CCPA if GPC is set', () => {
			setMockGpcValue( true );
			isRegionInCcpaZone.mockReturnValue( true );

			expect( mayWeTrackUserGpcInCcpaRegion() ).toBe( false );
		} );

		test( 'we may track a user outside CCPA if GPC is set', () => {
			setMockGpcValue( true );
			isRegionInCcpaZone.mockReturnValue( false );

			expect( mayWeTrackUserGpcInCcpaRegion() ).toBe( true );
		} );

		test( 'we may track a user outside CCPA if GPC is undefined', () => {
			setMockGpcValue( undefined );
			isRegionInCcpaZone.mockReturnValue( false );

			expect( mayWeTrackUserGpcInCcpaRegion() ).toBe( true );
		} );
	} );
} );
