/**
 * @jest-environment jsdom
 */

const mockUseTranslate = () => ( text ) => text;
const mockTranslate = ( text ) => text;
const mockGetConnectedAccountDefaultCurrencyForSiteId = () => 'USD';
const mockGetConnectedAccountMinimumCurrencyForSiteId = () => 0.5;
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
jest.mock( 'react-redux', () => ( {
	...jest.requireActual( 'react-redux' ),
	__: jest.fn(),
	sprintf: jest.fn(),
} ) );
jest.mock( 'calypso/state/ui/selectors/get-selected-site-id' );
jest.mock( 'calypso/state/memberships/product-list/selectors' );
jest.mock( 'calypso/state/memberships/settings/selectors' );
jest.mock( 'calypso/state/ui/selectors' );

import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
	limit_per_user: 5,
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

	const getRandomButton = () => screen.getByText( 'Random' );
	const getCodeTextbox = () => screen.getByLabelText( 'Coupon code' );
	const getDiscountTypeSelect = () => screen.getByLabelText( 'Discount type' );
	const getAmountOption = () => screen.getByRole( 'option', { name: 'Amount' } );
	const getPercentageOption = () => screen.getByRole( 'option', { name: 'Percentage' } );
	const getAmountInput = () => screen.getByLabelText( 'Amount' );
	const getLimitDurationToggle = () => screen.getByRole( 'checkbox', { name: 'Duration' } );
	const getLimitDurationSelection = () =>
		screen.getByRole( 'combobox', { name: 'duration selection' } );
	const getLimitCouponsToggle = () =>
		screen.getByRole( 'checkbox', { name: 'Limit coupon to specific emails' } );
	const getLimitCouponsTextInput = () =>
		screen.getByRole( 'textbox', { name: 'limit coupon to specific emails text input' } );

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
		[ ...document.getElementsByClassName( 'ReactModalPortal' ) ].map( ( el ) => {
			document.body.removeChild( el );
		} );
		modalRoot = null;
		global.Date = RealDate;
	} );

	test( 'should render empty form when no coupon is provided', () => {
		mockDate( '2023-06-23T14:23:44z' );
		render(
			<WrappedRecurringPaymentsCouponAddEditModal closeDialog={ closeDialog } coupon={ {} } />
		);
		const codeTextbox = getCodeTextbox();
		const amountOption = getAmountOption();
		const percentageOption = getPercentageOption();
		const amountInput = getAmountInput();
		const limitDurationToggle = getLimitDurationToggle();
		const limitDurationSelection = getLimitDurationSelection();
		const limitCouponsToggle = getLimitCouponsToggle();
		const limitCouponsTextInput = getLimitCouponsTextInput();

		expect( codeTextbox.value ).toEqual( '' );
		expect( amountOption.selected ).toBe( false );
		expect( percentageOption.selected ).toBe( true );
		expect( amountInput ).name = 'discount_percentage';
		expect( amountInput ).type = 'text';
		expect( amountInput ).value = '';
		expect( limitDurationToggle ).not.toBeChecked();
		expect( limitDurationSelection ).toBeDisabled();
		expect( limitCouponsToggle ).not.toBeChecked();
		expect( limitCouponsTextInput ).toBeDisabled();
	} );

	test( 'should generate a new coupon code when the random button is clicked', () => {
		mockDate( '2023-06-23T14:23:44z' );
		render(
			<WrappedRecurringPaymentsCouponAddEditModal closeDialog={ closeDialog } coupon={ {} } />
		);
		const randomButton = getRandomButton();
		const codeTextbox = getCodeTextbox();

		expect( codeTextbox.value ).toEqual( '' );
		waitFor( () => randomButton.click() );
		waitFor( () => {
			const generatedCode = codeTextbox.value;
			expect( generatedCode ).not.toEqual( '' );
			expect( generatedCode.length ).toBeGreaterThan( 3 );
		} );
	} );

	test( 'should show discount amount input when discount type is amount', async () => {
		mockDate( '2023-06-23T14:23:44z' );
		render(
			<WrappedRecurringPaymentsCouponAddEditModal closeDialog={ closeDialog } coupon={ {} } />
		);
		const discountTypeSelect = getDiscountTypeSelect();
		const amountOption = getAmountOption();
		const percentageOption = getPercentageOption();
		const amountInput = getAmountInput();

		expect( amountOption.selected ).toBe( false );
		expect( percentageOption.selected ).toBe( true );
		expect( amountInput ).name = 'discount_percentage';
		expect( amountInput ).type = 'text';
		expect( amountInput ).value = '';

		await userEvent.selectOptions( discountTypeSelect, amountOption );

		expect( amountOption.selected ).toBe( true );
		expect( percentageOption.selected ).toBe( false );
		expect( amountInput ).name = 'discount_value';
		expect( amountInput ).type = 'number';
		expect( amountInput ).value = '';
	} );

	test( 'should enable select dropdown if duration other than default', () => {
		mockDate( '2023-06-23T14:23:44z' );
		render(
			<WrappedRecurringPaymentsCouponAddEditModal
				closeDialog={ closeDialog }
				coupon={ { duration: COUPON_DURATION_3_MONTHS } }
			/>
		);
		expect( screen.getByRole( 'checkbox', { name: 'Duration' } ) ).toBeChecked();
		expect( screen.getByRole( 'combobox', { name: 'duration selection' } ) ).not.toBeDisabled();
	} );

	test( 'should show select dropdown as disabled unless toggled', () => {
		mockDate( '2023-06-23T14:23:44z' );
		render(
			<WrappedRecurringPaymentsCouponAddEditModal closeDialog={ closeDialog } coupon={ {} } />
		);
		const limitDurationToggle = getLimitDurationToggle();
		const limitDurationSelection = getLimitDurationSelection();
		expect( limitDurationToggle ).not.toBeChecked();
		expect( limitDurationSelection ).toBeDisabled();

		act( () => limitDurationToggle.click() );

		expect( limitDurationToggle ).toBeChecked();
		expect( limitDurationSelection ).not.toBeDisabled();
	} );

	test( 'should enable emails textarea if email allow list other than default', () => {
		mockDate( '2023-06-23T14:23:44z' );
		const email_allow_list = [ '*@*.edu', '*@automattic.com' ];
		render(
			<WrappedRecurringPaymentsCouponAddEditModal
				closeDialog={ closeDialog }
				coupon={ { email_allow_list } }
			/>
		);
		const limitCouponsToggle = getLimitCouponsToggle();
		const limitCouponsTextInput = getLimitCouponsTextInput();
		expect( limitCouponsToggle ).toBeChecked();
		expect( limitCouponsTextInput ).not.toBeDisabled();
		expect( limitCouponsTextInput.value ).toEqual( email_allow_list.join( ', ' ) );
	} );

	test( 'should show email textbox as disabled unless toggled', () => {
		mockDate( '2023-06-23T14:23:44z' );
		render(
			<WrappedRecurringPaymentsCouponAddEditModal closeDialog={ closeDialog } coupon={ {} } />
		);
		const limitCouponsToggle = getLimitCouponsToggle();
		const limitCouponsTextInput = getLimitCouponsTextInput();
		expect( limitCouponsToggle ).not.toBeChecked();
		expect( limitCouponsTextInput ).toBeDisabled();

		act( () => limitCouponsToggle.click() );

		expect( limitCouponsToggle ).toBeChecked();
		expect( limitCouponsTextInput ).not.toBeDisabled();
	} );

	test( 'should render form correctly when a coupon is provided', () => {
		mockDate( '2023-06-23T14:23:44z' );
		render(
			<WrappedRecurringPaymentsCouponAddEditModal
				closeDialog={ closeDialog }
				coupon={ testCoupon1 }
			/>
		);
		const codeTextbox = getCodeTextbox();
		const amountOption = getAmountOption();
		const percentageOption = getPercentageOption();
		const amountInput = getAmountInput();
		const limitDurationToggle = getLimitDurationToggle();
		const limitDurationSelection = getLimitDurationSelection();
		const limitCouponsToggle = getLimitCouponsToggle();
		const limitCouponsTextInput = getLimitCouponsTextInput();
		const limitedByDuration = testCoupon1.limit_per_user > 0;
		const limitedByEmail = testCoupon1.email_allow_list.length > 0;

		expect( codeTextbox.value ).toEqual( testCoupon1.coupon_code );
		expect( amountOption.selected ).toBe(
			COUPON_DISCOUNT_TYPE_AMOUNT === testCoupon1.discount_type
		);
		expect( percentageOption.selected ).toBe(
			COUPON_DISCOUNT_TYPE_PERCENTAGE === testCoupon1.discount_type
		);
		expect( amountInput ).name = 'discount_' + testCoupon1.discount_type;
		expect( amountInput ).type =
			COUPON_DISCOUNT_TYPE_AMOUNT === testCoupon1.discount_type ? 'number' : 'text';
		expect( amountInput ).value = testCoupon1.discount_value;

		expect( limitDurationToggle.checked ).toBe( limitedByDuration );
		expect( limitDurationSelection.disabled ).toBe( ! limitedByDuration );
		expect( limitCouponsToggle.checked ).toBe( limitedByEmail );
		expect( limitCouponsTextInput ).not.toBeDisabled( ! limitedByEmail );
		expect( limitCouponsTextInput.value ).toEqual( testCoupon1.email_allow_list.join( ', ' ) );
	} );
} );
