/**
 * @jest-environment jsdom
 */

const mockUseTranslate = () => ( text ) => text;
const mockTranslate = ( text ) => text;
const mockGetConnectedAccountDefaultCurrencyForSiteId = () => 'USD';
const mockGetConnectedAccountMinimumCurrencyForSiteId = () => 0.5;

jest.mock( 'i18n-calypso', () => ( {
	...jest.requireActual( 'i18n-calypso' ),
	useTranslate: jest.fn(),
	translate: jest.fn(),
} ) );
jest.mock( '@wordpress/i18n', () => ( {
	...jest.requireActual( '@wordpress/i18n' ),
	__: jest.fn(),
} ) );
jest.mock( 'react-redux', () => ( {
	...jest.requireActual( 'react-redux' ),
	__: jest.fn(),
	sprintf: jest.fn(),
} ) );
jest.mock( 'calypso/state/ui/selectors/get-selected-site-id' );
jest.mock( 'calypso/state/memberships/product-list/selectors' );
jest.mock( 'calypso/state/memberships/settings/selectors' );
jest.mock( 'calypso/state/ui/selectors' );

import { act, render, screen } from '@testing-library/react';
import { __ } from '@wordpress/i18n';
import { translate, useTranslate } from 'i18n-calypso';
import { unmountComponentAtNode } from 'react-dom';
import Modal from 'react-modal';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import {
	getconnectedAccountDefaultCurrencyForSiteId,
	getconnectedAccountMinimumCurrencyForSiteId,
} from '../../../../../state/memberships/settings/selectors';
import {
	COUPON_DISCOUNT_TYPE_AMOUNT,
	COUPON_DISCOUNT_TYPE_PERCENTAGE,
	COUPON_DURATION_3_MONTHS,
	COUPON_DURATION_FOREVER,
} from '../../../memberships/constants';
import RecurringPaymentsCouponAddEditModal from '../index';

const testCoupon1 = {
	ID: 1,
	coupon_code: 'COUPON1',
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
const testCoupon2 = {
	ID: 2,
	coupon_code: 'COUPON2',
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
const testCoupon3 = {
	ID: 3,
	coupon_code: 'COUPON3',
	cannot_be_combined: true,
	can_be_combined: false, // TODO: remove after backend migration to 'cannot_be_combined';
	first_time_purchase_only: true,
	start_date: '2023-12-25',
	end_date: '2024-10-23',
	plan_ids_allow_list: [],
	limit_per_user: 0,
	use_duration: true,
	use_email_allow_list: true,
	duration: COUPON_DURATION_3_MONTHS,
	email_allow_list: [],
	discount_type: COUPON_DISCOUNT_TYPE_AMOUNT,
	discount_value: 10,
	discount_percentage: 0,
	discount_currency: 'USD',
};

const initialState = {
	sites: { items: {} },
	siteSettings: { items: {} },
	ui: { selectedSiteId: 1 },
	memberships: {
		couponList: {
			items: {
				1: [ testCoupon1, testCoupon2, testCoupon3 ],
			},
		},
		productsList: {
			items: {},
		},
	},
};
const closeDialog = () => {};

function WrappedRecurringPaymentsCouponAddEditModal( props ) {
	const mockStore = configureStore();
	const store = mockStore( initialState );

	return (
		<Provider store={ store }>
			<RecurringPaymentsCouponAddEditModal { ...props } />
		</Provider>
	);
}

describe( 'RecurringPaymentsCouponAddEditModal', () => {
	let modalRoot;

	beforeEach( () => {
		jest.clearAllMocks();

		useTranslate.mockImplementation( mockUseTranslate );
		translate.mockImplementation( mockTranslate );
		__.mockImplementation( mockTranslate );
		getconnectedAccountDefaultCurrencyForSiteId.mockImplementation(
			mockGetConnectedAccountDefaultCurrencyForSiteId
		);
		getconnectedAccountMinimumCurrencyForSiteId.mockImplementation(
			mockGetConnectedAccountMinimumCurrencyForSiteId
		);

		modalRoot = document.createElement( 'div' );
		modalRoot.setAttribute( 'id', 'wpcom' );
		document.body.appendChild( modalRoot );
		Modal.setAppElement( modalRoot );
	} );

	afterEach( () => {
		unmountComponentAtNode( modalRoot );
		document.body.removeChild( modalRoot );
		modalRoot = null;
	} );

	test( 'should render empty form when no coupon is provided', () => {
		render(
			<WrappedRecurringPaymentsCouponAddEditModal closeDialog={ closeDialog } coupon={ {} } />
		);
		expect( document.body ).toMatchSnapshot();
	} );

	test( 'should generate a new coupon code when the random button is clicked', () => {
		render(
			<WrappedRecurringPaymentsCouponAddEditModal closeDialog={ closeDialog } coupon={ {} } />
		);
		const randomButton = screen.getByText( 'Random' );
		expect( screen.getByLabelText( 'Coupon code' ).value ).toEqual( '' );
		act( () => {
			randomButton.click();
		} );
		const generatedCode = screen.getByLabelText( 'Coupon code' ).value;
		expect( generatedCode ).not.toEqual( '' );
		expect( generatedCode.length ).toBeGreaterThan( 3 );
	} );

	test( 'should render form correctly when a coupon is provided', () => {
		render(
			<WrappedRecurringPaymentsCouponAddEditModal
				closeDialog={ closeDialog }
				coupon={ testCoupon1 }
			/>
		);
		expect( document.body ).toMatchSnapshot();
	} );
} );
