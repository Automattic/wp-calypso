/**
 * @jest-environment jsdom
 */
import {
	BLACK_FRIDAY_2026_COUPON,
	BLACK_FRIDAY_2026_START,
} from 'calypso/lib/promotions/black-friday-2026';
import { plans } from '../controller';

jest.mock( '@automattic/calypso-config', () => {
	const config = ( key ) => ( 'env' === key ? 'production' : undefined );
	config.isEnabled = ( flag ) => 'black-friday-2026' === flag;
	return { __esModule: true, default: config, isEnabled: config.isEnabled };
} );
jest.mock( '@automattic/calypso-router', () => ( { redirect: jest.fn() } ) );
jest.mock( 'calypso/lib/plans/untangling-plans-experiment', () => ( {
	isPlansPageUntangled: () => false,
} ) );
jest.mock( 'calypso/my-sites/plans/jetpack-plans/controller', () => ( {
	productSelect: jest.fn(),
} ) );
jest.mock( 'calypso/my-sites/plans/jetpack-plans/plans-header', () => jest.fn() );
jest.mock( 'calypso/sites/controller', () => ( { siteDashboard: jest.fn() } ) );
jest.mock( 'calypso/state/selectors/is-site-wpcom', () => () => true );
jest.mock( 'calypso/state/sites/selectors', () => ( { isCommerceGardenSite: () => false } ) );
jest.mock( 'calypso/state/ui/selectors', () => ( {
	getSelectedSite: () => null,
	getSelectedSiteId: () => 1,
} ) );
jest.mock( '../main', () => () => null );

const getCoupon = ( query ) => {
	const context = { params: { site: 'example.com' }, query, store: { getState: () => ( {} ) } };
	plans( context, jest.fn() );
	return context.primary.props.coupon;
};

describe( 'plans controller coupon', () => {
	let nowSpy;

	afterEach( () => nowSpy.mockRestore() );

	it( 'defaults to the Black Friday coupon during the sale', () => {
		nowSpy = jest.spyOn( Date, 'now' ).mockReturnValue( BLACK_FRIDAY_2026_START + 1000 );
		expect( getCoupon( {} ) ).toBe( BLACK_FRIDAY_2026_COUPON );
	} );

	it( 'keeps an explicit coupon or discount during the sale', () => {
		nowSpy = jest.spyOn( Date, 'now' ).mockReturnValue( BLACK_FRIDAY_2026_START + 1000 );
		expect( getCoupon( { coupon: 'OTHER' } ) ).toBe( 'OTHER' );
		expect( getCoupon( { discount: 'LEGACY' } ) ).toBe( 'LEGACY' );
	} );

	it( 'leaves the coupon empty outside the sale', () => {
		nowSpy = jest.spyOn( Date, 'now' ).mockReturnValue( BLACK_FRIDAY_2026_START - 1 );
		expect( getCoupon( {} ) ).toBeUndefined();
	} );
} );
