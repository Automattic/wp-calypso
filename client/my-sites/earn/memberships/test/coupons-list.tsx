/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { unmountComponentAtNode } from 'react-dom';
import Modal from 'react-modal';
import membershipsReducer from 'calypso/state/memberships/reducer';
import siteSettingsReducer from 'calypso/state/site-settings/reducer';
import uiReducer from 'calypso/state/ui/reducer';
import { renderWithProvider } from '../../../../test-helpers/testing-library';
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

describe( 'CouponsList', () => {
	let modalRoot;

	const getAddCouponButton = () => screen.getByRole( 'button', { name: 'Add a new coupon' } );
	const queryAddCouponButton = () => screen.queryByRole( 'button', { name: 'Add a new coupon' } );
	const queryAddEditCouponDialog = () => screen.queryByRole( 'dialog', { name: 'Add a coupon' } );
	const getCodeTextbox = () =>
		screen.getByRole( 'textbox', { name: 'Enter a custom coupon code' } );
	const getDiscountTypeSelect = () => screen.getByRole( 'combobox', { name: 'Discount type' } );
	const getDiscountPercentageInput = () =>
		screen.getByRole( 'textbox', { name: 'Discount percentage' } );
	const queryDiscountPercentageInput = () =>
		screen.queryByRole( 'textbox', { name: 'Discount percentage' } );
	const queryDiscountValueInput = () => screen.queryByRole( 'textbox', { name: 'Discount value' } );
	const getLimitDurationToggle = () => screen.getByRole( 'checkbox', { name: 'Duration' } );
	const getLimitDurationSelection = () =>
		screen.getByRole( 'combobox', { name: 'Duration selection' } );
	const getLimitCouponsToggle = () =>
		screen.getByRole( 'checkbox', { name: 'Limit coupon to specific emails' } );
	const getLimitCouponsTextInput = () =>
		screen.getByRole( 'textbox', { name: 'Limit coupon to specific emails text input' } );

	beforeEach( () => {
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

	test( 'should render nothing when feature is disabled', () => {
		const render = ( el, options ) =>
			renderWithProvider( el, {
				...options,
				initialState: {
					...initialState,
					memberships: {
						settings: {
							1: {
								couponsAndGiftsEnabled: false,
								isConnected: true,
								connectedAccountMinimumCurrency: {
									USD: 0.5,
								},
							},
						},
						couponList: {
							items: {},
						},
						productList: {
							items: {
								1: [ testProduct1, testProduct2 ],
							},
						},
					},
				},
				reducers: {
					ui: uiReducer,
					memberships: membershipsReducer,
					siteSettings: siteSettingsReducer,
				},
			} );
		render( <CouponsList /> );

		const missingAddCouponButton = queryAddCouponButton();
		const missingAddEditCouponDialog = queryAddEditCouponDialog();
		const missingDiscountValueInput = queryDiscountValueInput();
		const missingDiscountPercentageInput = queryDiscountPercentageInput();

		expect( missingAddEditCouponDialog ).not.toBeInTheDocument();
		expect( missingAddCouponButton ).not.toBeInTheDocument();
		expect( missingDiscountPercentageInput ).not.toBeInTheDocument();
		expect( missingDiscountValueInput ).not.toBeInTheDocument();
	} );

	test( 'should render with an empty list when no coupons are provided', () => {
		const render = ( el, options ) =>
			renderWithProvider( el, {
				...options,
				initialState: {
					...initialState,
					memberships: {
						settings: {
							1: {
								couponsAndGiftsEnabled: true,
								isConnected: true,
								connectedAccountMinimumCurrency: {
									USD: 0.5,
								},
							},
						},
						couponList: {
							items: {},
						},
						productList: {
							items: {
								1: [ testProduct1, testProduct2 ],
							},
						},
					},
				},
				reducers: {
					ui: uiReducer,
					memberships: membershipsReducer,
					siteSettings: siteSettingsReducer,
				},
			} );
		render( <CouponsList /> );
		const addCouponButton = getAddCouponButton();
		const missingAddEditCouponDialog = queryAddEditCouponDialog();
		const missingDiscountValueInput = queryDiscountValueInput();
		const missingDiscountPercentageInput = queryDiscountPercentageInput();

		expect( addCouponButton ).toBeInTheDocument();
		expect( missingAddEditCouponDialog ).not.toBeInTheDocument();
		expect( missingDiscountPercentageInput ).not.toBeInTheDocument();
		expect( missingDiscountValueInput ).not.toBeInTheDocument();
	} );

	test( 'should render a list with coupons when present for site', () => {
		const render = ( el, options ) =>
			renderWithProvider( el, {
				...options,
				initialState: {
					...initialState,
					memberships: {
						settings: {
							1: {
								couponsAndGiftsEnabled: true,
								isConnected: true,
								connectedAccountMinimumCurrency: {
									USD: 0.5,
								},
							},
						},
						couponList: {
							items: {
								1: [ testCoupon1, testCoupon2, testCoupon3 ],
							},
						},
						productList: {
							items: {
								1: [ testProduct1, testProduct2 ],
							},
						},
					},
				},
				reducers: {
					ui: uiReducer,
					memberships: membershipsReducer,
					siteSettings: siteSettingsReducer,
				},
			} );
		render( <CouponsList /> );
		const addCouponButton = getAddCouponButton();
		const missingAddEditCouponDialog = queryAddEditCouponDialog();
		const missingDiscountValueInput = queryDiscountValueInput();
		const missingDiscountPercentageInput = queryDiscountPercentageInput();

		// TODO: improve a11y for coupon list to be able to access toggle menu and assert that each coupon has been rendered without snapshot

		expect( addCouponButton ).toBeInTheDocument();
		expect( missingAddEditCouponDialog ).not.toBeInTheDocument();
		expect( missingDiscountPercentageInput ).not.toBeInTheDocument();
		expect( missingDiscountValueInput ).not.toBeInTheDocument();
	} );

	test( 'should display new coupon modal when clicking add coupon', async () => {
		const user = userEvent.setup();
		const render = ( el, options ) =>
			renderWithProvider( el, {
				...options,
				initialState: {
					...initialState,
					memberships: {
						settings: {
							1: {
								couponsAndGiftsEnabled: true,
								isConnected: true,
								connectedAccountMinimumCurrency: {
									USD: 0.5,
								},
							},
						},
						couponList: {
							items: {
								1: [ testCoupon1, testCoupon2, testCoupon3 ],
							},
						},
						productList: {
							items: {
								1: [ testProduct1, testProduct2 ],
							},
						},
					},
				},
				reducers: {
					ui: uiReducer,
					memberships: membershipsReducer,
					siteSettings: siteSettingsReducer,
				},
			} );
		render( <CouponsList /> );

		await user.click( screen.getByRole( 'button', { name: 'Add a new coupon' } ) );

		const codeTextbox = getCodeTextbox();
		const discountTypeSelect = getDiscountTypeSelect();
		const discountPercentageInput = getDiscountPercentageInput();
		const discountValueInput = queryDiscountValueInput();
		const limitDurationToggle = getLimitDurationToggle();
		const limitDurationSelection = getLimitDurationSelection();
		const limitCouponsToggle = getLimitCouponsToggle();
		const limitCouponsTextInput = getLimitCouponsTextInput();

		expect( codeTextbox ).not.toHaveValue();
		expect( discountTypeSelect ).toHaveValue( COUPON_DISCOUNT_TYPE_PERCENTAGE );
		expect( discountPercentageInput ).toBeInTheDocument();
		expect( discountValueInput ).not.toBeInTheDocument();
		expect( limitDurationToggle ).not.toBeChecked();
		expect( limitDurationSelection ).toBeDisabled();
		expect( limitCouponsToggle ).not.toBeChecked();
		expect( limitCouponsTextInput ).toBeDisabled();
	} );
} );
