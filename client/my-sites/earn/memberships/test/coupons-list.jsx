/**
 * @jest-environment jsdom
 */

const mockUseTranslate = () => ( text ) => text;
const mockTranslate = ( text ) => text;
const RealDate = Date;
const mockDate = ( isoDate ) =>
	( global.Date = class extends RealDate {
		constructor() {
			return new RealDate( isoDate );
		}
	} );

jest.mock( 'i18n-calypso', () => ( {
	...jest.requireActual( 'i18n-calypso' ),
	useTranslate: jest.fn(),
	translate: jest.fn(),
} ) );
jest.mock( '@wordpress/i18n', () => ( {
	...jest.requireActual( '@wordpress/i18n' ),
	__: jest.fn(),
} ) );

import { act, render, screen } from '@testing-library/react';
import { __ } from '@wordpress/i18n';
import { translate, useTranslate } from 'i18n-calypso';
import { unmountComponentAtNode } from 'react-dom';
import Modal from 'react-modal';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import {
	COUPON_DISCOUNT_TYPE_AMOUNT,
	COUPON_DISCOUNT_TYPE_PERCENTAGE,
	COUPON_DURATION_3_MONTHS,
	COUPON_DURATION_FOREVER,
} from '../constants';
import CouponsList from '../coupons-list';

const productData = {
	currency: 'USD',
	buyer_can_change_amount: false,
	multiple_per_user: false,
	welcome_email_content: 'Welcome!',
	subscribe_as_site_subscriber: true,
	type: 'newsletter',
	is_editable: false,
};

const testProduct1 = {
	...productData,
	ID: 9,
	price: 5,
	title: 'Monthly Subscription',
	interval: '1 month',
	renewal_schedule: '1 month',
};

const testProduct2 = {
	...productData,
	ID: 10,
	price: 40,
	title: 'Yearly Subscription',
	interval: '1 year',
	renewal_schedule: '1 year',
};

const couponData = {
	cannot_be_combined: false,
	can_be_combined: true, // TODO: remove after backend migration to 'cannot_be_combined';
	first_time_purchase_only: false,
	start_date: '2023-12-25',
	end_date: '2024-10-23',
	plan_ids_allow_list: [],
	limit_per_user: 0,
	use_duration: false,
	use_email_allow_list: true,
	duration: COUPON_DURATION_FOREVER,
	email_allow_list: [ '*@*.edu', '*@*.org' ],
	discount_type: COUPON_DISCOUNT_TYPE_PERCENTAGE,
	discount_value: 0,
	discount_percentage: 90,
	discount_currency: 'USD',
};

const testCoupon1 = {
	...couponData,
	ID: 1,
	coupon_code: 'COUPON1',
};

const testCoupon2 = {
	...couponData,
	ID: 2,
	coupon_code: 'COUPON2',
};

const testCoupon3 = {
	...couponData,
	ID: 3,
	coupon_code: 'COUPON3',
	cannot_be_combined: true,
	can_be_combined: false, // TODO: remove after backend migration to 'cannot_be_combined';
	first_time_purchase_only: true,
	use_duration: true,
	duration: COUPON_DURATION_3_MONTHS,
	email_allow_list: [],
	discount_type: COUPON_DISCOUNT_TYPE_AMOUNT,
	discount_value: 10,
	discount_percentage: 0,
};

const initialState = {
	sites: { items: { 1: { ID: 1 } }, features: { 1: { data: { active: [ 'donations' ] } } } },
	ui: { selectedSiteId: 1 },
	memberships: {
		couponList: {
			items: {},
		},
		productList: {
			items: {},
		},
		settings: {},
	},
};

function WrappedCouponsList( { testEnabled, testCoupons } ) {
	const mockStore = configureStore();
	const mockState = {
		...initialState,
		memberships: {
			settings: {
				1: {
					couponsAndGiftsEnabled: testEnabled,
					connectedAccountId: 123,
					connectedAccountMinimumCurrency: {
						USD: 0.5,
					},
				},
			},
			couponList: {
				items: {
					1: testCoupons,
				},
			},
			productList: {
				items: {
					1: [ testProduct1, testProduct2 ],
				},
			},
		},
	};
	const store = mockStore( mockState );

	return (
		<Provider store={ store }>
			<CouponsList />
		</Provider>
	);
}

describe( 'CouponsList', () => {
	let modalRoot;

	beforeEach( () => {
		jest.clearAllMocks();

		useTranslate.mockImplementation( mockUseTranslate );
		translate.mockImplementation( mockTranslate );
		__.mockImplementation( mockTranslate );

		modalRoot = document.createElement( 'div' );
		modalRoot.setAttribute( 'id', 'wpcom' );
		document.body.appendChild( modalRoot );
		Modal.setAppElement( modalRoot );
	} );

	afterEach( () => {
		unmountComponentAtNode( modalRoot );
		document.body.removeChild( modalRoot );
		modalRoot = null;
		global.Date = RealDate;
	} );

	test( 'should render nothing when feature is disabled', () => {
		const { container } = render( <WrappedCouponsList /> );
		expect( container ).toMatchSnapshot();
	} );

	test( 'should render with an empty list when no coupons are provided', () => {
		const { container } = render( <WrappedCouponsList testEnabled /> );
		expect( container ).toMatchSnapshot();
	} );

	test( 'should render a list with coupons when present for site', () => {
		const { container } = render(
			<WrappedCouponsList
				testEnabled
				testCoupons={ [ testCoupon1, testCoupon2, testCoupon3 ] }
			/>
		);
		expect( container ).toMatchSnapshot();
	} );

	test( 'should display new coupon modal when clicking add coupon', () => {
		mockDate( '2023-06-23T14:23:44z' );
		render(
			<WrappedCouponsList
				testEnabled
				testCoupons={ [ testCoupon1, testCoupon2, testCoupon3 ] }
			/>
		);
		act( () => {
			screen.getByRole( 'button', { name: 'Add a new coupon' } ).click();
		} );
		expect( document.body ).toMatchSnapshot();
	} );
} );
