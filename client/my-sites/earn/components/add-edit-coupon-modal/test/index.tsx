/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues

const mockGetConnectedAccountDefaultCurrencyForSiteId = () => 'USD';
const mockGetConnectedAccountMinimumCurrencyForSiteId = () => 0.5;

jest.mock( 'calypso/state/ui/selectors/get-selected-site-id' );
jest.mock( 'calypso/state/memberships/product-list/selectors' );
jest.mock( 'calypso/state/memberships/settings/selectors' );
jest.mock( 'calypso/state/ui/selectors' );

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { unmountComponentAtNode } from 'react-dom';
import Modal from 'react-modal';
import {
	getconnectedAccountDefaultCurrencyForSiteId,
	getconnectedAccountMinimumCurrencyForSiteId,
} from '../../../../../state/memberships/settings/selectors';
import { renderWithProvider } from '../../../../../test-helpers/testing-library';
import {
	COUPON_DISCOUNT_TYPE_AMOUNT,
	COUPON_DISCOUNT_TYPE_PERCENTAGE,
	COUPON_DURATION_3_MONTHS,
	COUPON_DURATION_FOREVER,
} from '../../../memberships/constants';
import RecurringPaymentsCouponAddEditModal from '../index';

const closeDialog = jest.fn();

describe( 'RecurringPaymentsCouponAddEditModal', () => {
	let modalRoot;

	const getRandomButton = () =>
		screen.getByRole( 'button', { name: 'Generate random coupon code' } );
	const getCodeTextbox = () =>
		screen.getByRole( 'textbox', { name: 'Enter a custom coupon code' } );
	const getDiscountTypeSelect = () => screen.getByRole( 'combobox', { name: 'Discount type' } );
	const getAmountOption = () => screen.getByRole( 'option', { name: 'Amount' } );
	const getDiscountPercentageInput = () =>
		screen.getByRole( 'textbox', { name: 'Discount percentage' } );
	const getDiscountValueInput = () => screen.getByRole( 'textbox', { name: 'Discount value' } );
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
		jest.clearAllMocks();

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
	} );

	test( 'should render empty form when no coupon is provided', () => {
		const render = ( el, options ) => renderWithProvider( el, { ...options } );
		render( <RecurringPaymentsCouponAddEditModal closeDialog={ closeDialog } coupon={ {} } /> );
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

	test( 'should generate a new coupon code when the random button is clicked', async () => {
		const user = userEvent.setup();
		const render = ( el, options ) => renderWithProvider( el, { ...options } );
		render( <RecurringPaymentsCouponAddEditModal closeDialog={ closeDialog } coupon={ {} } /> );
		const randomButton = getRandomButton();
		const codeTextbox = getCodeTextbox();

		expect( codeTextbox ).not.toHaveValue();

		await user.click( randomButton );

		expect( codeTextbox ).toHaveValue();
		expect( codeTextbox.value.length ).toBeGreaterThan( 3 );
	} );

	test( 'should show discount amount input when discount type is amount', async () => {
		const user = userEvent.setup();
		const render = ( el, options ) => renderWithProvider( el, { ...options } );
		render( <RecurringPaymentsCouponAddEditModal closeDialog={ closeDialog } coupon={ {} } /> );
		const discountTypeSelect = getDiscountTypeSelect();
		const amountOption = getAmountOption();
		const discountPercentageInput = getDiscountPercentageInput();
		const missingDiscountValueInput = queryDiscountValueInput();
		const missingDiscountPercentageInput = queryDiscountPercentageInput();

		expect( discountTypeSelect ).toHaveValue( COUPON_DISCOUNT_TYPE_PERCENTAGE );
		expect( discountPercentageInput ).toBeInTheDocument();
		expect( missingDiscountValueInput ).not.toBeInTheDocument();

		await user.selectOptions( discountTypeSelect, amountOption );

		const discountValueInput = getDiscountValueInput();
		expect( discountTypeSelect ).toHaveValue( COUPON_DISCOUNT_TYPE_AMOUNT );
		expect( missingDiscountPercentageInput ).not.toBeInTheDocument();
		expect( discountValueInput ).toBeInTheDocument();
	} );

	test( 'should enable select dropdown if duration other than default', () => {
		const render = ( el, options ) => renderWithProvider( el, { ...options } );
		render(
			<RecurringPaymentsCouponAddEditModal
				closeDialog={ closeDialog }
				coupon={ { duration: COUPON_DURATION_3_MONTHS } }
			/>
		);
		expect( screen.getByRole( 'checkbox', { name: 'Duration' } ) ).toBeChecked();
		expect( screen.getByRole( 'combobox', { name: 'Duration selection' } ) ).not.toBeDisabled();
	} );

	test( 'should show select dropdown as disabled unless toggled', async () => {
		const user = userEvent.setup();
		const render = ( el, options ) => renderWithProvider( el, { ...options } );
		render( <RecurringPaymentsCouponAddEditModal closeDialog={ closeDialog } coupon={ {} } /> );
		const limitDurationToggle = getLimitDurationToggle();
		const limitDurationSelection = getLimitDurationSelection();

		expect( limitDurationToggle ).not.toBeChecked();
		expect( limitDurationSelection ).toBeDisabled();

		await user.click( limitDurationToggle );

		expect( limitDurationToggle ).toBeChecked();
		expect( limitDurationSelection ).not.toBeDisabled();
	} );

	test( 'should enable emails textarea if email allow list other than default', () => {
		const render = ( el, options ) => renderWithProvider( el, { ...options } );
		const email_allow_list = [ '*@*.edu', '*@automattic.com' ];
		render(
			<RecurringPaymentsCouponAddEditModal
				closeDialog={ closeDialog }
				coupon={ { email_allow_list } }
			/>
		);
		const limitCouponsToggle = getLimitCouponsToggle();
		const limitCouponsTextInput = getLimitCouponsTextInput();

		expect( limitCouponsToggle ).toBeChecked();
		expect( limitCouponsTextInput ).not.toBeDisabled();
		expect( limitCouponsTextInput ).toHaveValue( email_allow_list.join( ', ' ) );
	} );

	test( 'should show email textbox as disabled unless toggled', async () => {
		const user = userEvent.setup();
		const render = ( el, options ) => renderWithProvider( el, { ...options } );
		render( <RecurringPaymentsCouponAddEditModal closeDialog={ closeDialog } coupon={ {} } /> );
		const limitCouponsToggle = getLimitCouponsToggle();
		const limitCouponsTextInput = getLimitCouponsTextInput();

		expect( limitCouponsToggle ).not.toBeChecked();
		expect( limitCouponsTextInput ).toBeDisabled();

		await user.click( limitCouponsToggle );

		expect( limitCouponsToggle ).toBeChecked();
		expect( limitCouponsTextInput ).not.toBeDisabled();
	} );

	test( 'should render form correctly when a coupon is provided', () => {
		const render = ( el, options ) => renderWithProvider( el, { ...options } );
		const testCoupon = {
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
		render(
			<RecurringPaymentsCouponAddEditModal closeDialog={ closeDialog } coupon={ testCoupon } />
		);
		const codeTextbox = getCodeTextbox();
		const discountTypeSelect = getDiscountTypeSelect();
		const discountPercentageInput = getDiscountPercentageInput();
		const discountValueInput = queryDiscountValueInput();
		const limitDurationToggle = getLimitDurationToggle();
		const limitDurationSelection = getLimitDurationSelection();
		const limitCouponsToggle = getLimitCouponsToggle();
		const limitCouponsTextInput = getLimitCouponsTextInput();

		expect( codeTextbox ).toHaveValue( testCoupon.coupon_code );
		expect( discountTypeSelect ).toHaveValue( testCoupon.discount_type );
		expect( discountPercentageInput ).toBeInTheDocument();
		expect( discountValueInput ).not.toBeInTheDocument();
		expect( limitDurationToggle ).not.toBeChecked();
		expect( limitDurationSelection ).toBeDisabled();
		expect( limitCouponsToggle ).toBeChecked();
		expect( limitCouponsTextInput ).not.toBeDisabled();
		expect( limitCouponsTextInput ).toHaveValue( testCoupon.email_allow_list.join( ', ' ) );
	} );
} );
