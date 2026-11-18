import config from '@automattic/calypso-config';
import {
	BLACK_FRIDAY_2026_COUPON,
	BLACK_FRIDAY_2026_END,
	BLACK_FRIDAY_2026_LIFECYCLE_COUPON,
	BLACK_FRIDAY_2026_PUBLIC_OFFER,
	BLACK_FRIDAY_2026_START,
	getBlackFriday2026OfferForCoupon,
	getBlackFriday2026OfferForVariation,
	isBlackFriday2026Active,
} from '../black-friday-2026';

jest.mock( '@automattic/calypso-config', () => ( {
	__esModule: true,
	default: Object.assign( jest.fn(), { isEnabled: jest.fn() } ),
} ) );

describe( 'isBlackFriday2026Active', () => {
	beforeEach( () => {
		( config.isEnabled as jest.Mock ).mockReturnValue( false );
	} );

	it( 'is active inside the window', () => {
		expect( isBlackFriday2026Active( BLACK_FRIDAY_2026_START ) ).toBe( true );
		expect( isBlackFriday2026Active( Date.UTC( 2026, 10, 28, 12 ) ) ).toBe( true );
		expect( isBlackFriday2026Active( BLACK_FRIDAY_2026_END - 1 ) ).toBe( true );
	} );

	it( 'is inactive before the window', () => {
		expect( isBlackFriday2026Active( BLACK_FRIDAY_2026_START - 1 ) ).toBe( false );
	} );

	it( 'is inactive after the window', () => {
		expect( isBlackFriday2026Active( BLACK_FRIDAY_2026_END ) ).toBe( false );
	} );

	it( 'is active outside the window when the flag is on', () => {
		( config.isEnabled as jest.Mock ).mockImplementation(
			( flag: string ) => flag === 'black-friday-2026'
		);
		expect( isBlackFriday2026Active( BLACK_FRIDAY_2026_START - 1 ) ).toBe( true );
		expect( isBlackFriday2026Active( BLACK_FRIDAY_2026_END ) ).toBe( true );
	} );
} );

describe( 'getBlackFriday2026OfferForVariation', () => {
	it( 'gives the lifecycle treatment group the 30% offer', () => {
		expect( getBlackFriday2026OfferForVariation( 'treatment' ) ).toEqual( {
			coupon: BLACK_FRIDAY_2026_LIFECYCLE_COUPON,
			percent: 30,
			isLifecycle: true,
		} );
	} );

	it( 'gives the lifecycle control group no offer', () => {
		expect( getBlackFriday2026OfferForVariation( 'control' ) ).toBeNull();
	} );

	it.each( [ null, undefined, 'something_else' ] )(
		'gives everyone outside the experiment the public offer (%s)',
		( variation ) => {
			expect( getBlackFriday2026OfferForVariation( variation ) ).toBe(
				BLACK_FRIDAY_2026_PUBLIC_OFFER
			);
		}
	);
} );

describe( 'getBlackFriday2026OfferForCoupon', () => {
	it( 'maps each sale coupon to its offer', () => {
		expect( getBlackFriday2026OfferForCoupon( BLACK_FRIDAY_2026_COUPON )?.percent ).toBe( 25 );
		expect( getBlackFriday2026OfferForCoupon( BLACK_FRIDAY_2026_LIFECYCLE_COUPON )?.percent ).toBe(
			30
		);
	} );

	it.each( [ 'OTHER', '', null, undefined ] )( 'has no offer for %s', ( coupon ) => {
		expect( getBlackFriday2026OfferForCoupon( coupon ) ).toBeNull();
	} );
} );
