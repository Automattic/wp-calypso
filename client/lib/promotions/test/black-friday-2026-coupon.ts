import {
	BLACK_FRIDAY_2026_COUPON,
	BLACK_FRIDAY_2026_END,
	BLACK_FRIDAY_2026_START,
} from '../black-friday-2026';
import { getCouponWithBlackFriday2026Default } from '../black-friday-2026-coupon';

const mockIsEnabled = jest.fn< boolean, [ string ] >( () => false );
let mockEnv = 'production';
jest.mock( '@automattic/calypso-config', () => {
	const config = ( key: string ) => ( 'env' === key ? mockEnv : undefined );
	config.isEnabled = ( flag: string ) => mockIsEnabled( flag );
	return { __esModule: true, default: config, isEnabled: config.isEnabled };
} );

const DURING = BLACK_FRIDAY_2026_START + 1000;

describe( 'getCouponWithBlackFriday2026Default', () => {
	beforeEach( () => {
		mockEnv = 'production';
		mockIsEnabled.mockImplementation( ( flag ) => flag === 'black-friday-2026' );
	} );

	it( 'defaults to the sale coupon inside the window', () => {
		expect( getCouponWithBlackFriday2026Default( undefined, DURING ) ).toBe(
			BLACK_FRIDAY_2026_COUPON
		);
		expect( getCouponWithBlackFriday2026Default( null, DURING ) ).toBe( BLACK_FRIDAY_2026_COUPON );
		expect( getCouponWithBlackFriday2026Default( '', DURING ) ).toBe( BLACK_FRIDAY_2026_COUPON );
	} );

	it( 'never overrides an explicit coupon', () => {
		expect( getCouponWithBlackFriday2026Default( 'OTHER', DURING ) ).toBe( 'OTHER' );
		expect( getCouponWithBlackFriday2026Default( 'OTHER', BLACK_FRIDAY_2026_END ) ).toBe( 'OTHER' );
	} );

	it( 'leaves the coupon empty outside the window', () => {
		expect(
			getCouponWithBlackFriday2026Default( undefined, BLACK_FRIDAY_2026_START - 1 )
		).toBeUndefined();
		expect(
			getCouponWithBlackFriday2026Default( undefined, BLACK_FRIDAY_2026_END )
		).toBeUndefined();
	} );

	it( 'leaves the coupon empty inside the window when the flag is off', () => {
		mockIsEnabled.mockReturnValue( false );
		expect( getCouponWithBlackFriday2026Default( undefined, DURING ) ).toBeUndefined();
	} );

	it( 'applies the sale coupon outside the window in development when the flag is on', () => {
		mockEnv = 'development';
		expect( getCouponWithBlackFriday2026Default( undefined, BLACK_FRIDAY_2026_END ) ).toBe(
			BLACK_FRIDAY_2026_COUPON
		);
	} );
} );
