/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import membershipsReducer from 'calypso/state/memberships/reducer';
import siteSettingsReducer from 'calypso/state/site-settings/reducer';
import uiReducer from 'calypso/state/ui/reducer';
import { renderWithProvider } from '../../../../../test-helpers/testing-library';
import ProductsSelector from '../products-selector';

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

const initialState = {
	sites: { items: {} },
	siteSettings: { items: {} },
	ui: { selectedSiteId: 1 },
	memberships: {
		couponList: {
			items: {},
		},
		productList: {
			items: {
				1: [ testProduct1, testProduct2 ],
			},
		},
	},
};

describe( 'ProductsSelector', () => {
	const getAnyProductCheckbox = () =>
		screen.getByRole( 'menuitemcheckbox', { name: 'Any product' } );
	const getYearlyProductCheckbox = () =>
		screen.getByRole( 'menuitemcheckbox', {
			name: 'Yearly Subscription : $40.00 / year',
		} );
	const getMonthlyProductCheckbox = () =>
		screen.getByRole( 'menuitemcheckbox', {
			name: 'Monthly Subscription : $5.00 / month',
		} );
	const getDropdownButton = ( name ) => screen.getByRole( 'button', { name } );

	test( 'should render with any product selected when no specific products have been selected', async () => {
		const render = ( el, options ) =>
			renderWithProvider( el, {
				...options,
				initialState,
				reducers: {
					ui: uiReducer,
					memberships: membershipsReducer,
					siteSettings: siteSettingsReducer,
				},
			} );
		const user = userEvent.setup();
		let editedPlanIdsAllowList = [];
		const setEditedPlanIdsAllowList = ( list ) => {
			editedPlanIdsAllowList = list;
		};
		render(
			<ProductsSelector
				onSelectedPlanIdsChange={ ( list ) => setEditedPlanIdsAllowList( list ) }
				initialSelectedList={ editedPlanIdsAllowList }
				allowMultiple
			/>
		);

		await user.click( getDropdownButton( 'Any product' ) );
		const anyProductCheckbox = getAnyProductCheckbox();
		const yearlyProductCheckbox = getYearlyProductCheckbox();
		const monthlyProductCheckbox = getMonthlyProductCheckbox();

		expect( anyProductCheckbox ).toBeChecked();
		expect( yearlyProductCheckbox ).toBeChecked();
		expect( monthlyProductCheckbox ).toBeChecked();
	} );

	test( 'should render with 1 product selected when 1 product has been selected', () => {
		const render = ( el, options ) =>
			renderWithProvider( el, {
				...options,
				initialState,
				reducers: {
					ui: uiReducer,
					memberships: membershipsReducer,
					siteSettings: siteSettingsReducer,
				},
			} );
		let editedPlanIdsAllowList = [ testProduct1.ID ];
		const setEditedPlanIdsAllowList = ( list ) => {
			editedPlanIdsAllowList = list;
		};
		render(
			<ProductsSelector
				onSelectedPlanIdsChange={ ( list ) => setEditedPlanIdsAllowList( list ) }
				initialSelectedList={ editedPlanIdsAllowList }
				allowMultiple
			/>
		);
		// Expect the button with the correct name to be rendered.
		expect( getDropdownButton( '1 product selected' ) ).toBeInTheDocument();
	} );

	test( 'should render with 2 products selected when 2 products have been selected', () => {
		const render = ( el, options ) =>
			renderWithProvider( el, {
				...options,
				initialState,
				reducers: {
					ui: uiReducer,
					memberships: membershipsReducer,
					siteSettings: siteSettingsReducer,
				},
			} );
		let editedPlanIdsAllowList = [ testProduct1.ID, testProduct2.ID ];
		const setEditedPlanIdsAllowList = ( list ) => {
			editedPlanIdsAllowList = list;
		};
		render(
			<ProductsSelector
				onSelectedPlanIdsChange={ ( list ) => setEditedPlanIdsAllowList( list ) }
				initialSelectedList={ editedPlanIdsAllowList }
				allowMultiple
			/>
		);
		// Expect the button with the correct name to be rendered.
		expect( getDropdownButton( '2 products selected.' ) ).not.toBeNull();
	} );

	test( 'clicking the button should show a dropdown with selected items selected', async () => {
		const render = ( el, options ) =>
			renderWithProvider( el, {
				...options,
				initialState,
				reducers: {
					ui: uiReducer,
					memberships: membershipsReducer,
					siteSettings: siteSettingsReducer,
				},
			} );
		const user = userEvent.setup();
		let editedPlanIdsAllowList = [ testProduct1.ID, testProduct2.ID ];
		const setEditedPlanIdsAllowList = ( list ) => {
			editedPlanIdsAllowList = list;
		};
		render(
			<ProductsSelector
				onSelectedPlanIdsChange={ ( list ) => setEditedPlanIdsAllowList( list ) }
				initialSelectedList={ editedPlanIdsAllowList }
				allowMultiple
			/>
		);

		await user.click( getDropdownButton( '2 products selected.' ) );
		const anyProductCheckbox = getAnyProductCheckbox();
		const yearlyProductCheckbox = getYearlyProductCheckbox();
		const monthlyProductCheckbox = getMonthlyProductCheckbox();

		// Only the monthly and yearly products are checked.
		// Despite this being all current products, "Any product" is not checked, as "Any product" means "Do not limit by product".
		expect( anyProductCheckbox ).not.toBeChecked();
		expect( yearlyProductCheckbox ).toBeChecked();
		expect( monthlyProductCheckbox ).toBeChecked();

		// Unchecking yearly product leaves only monthly product selected.
		await user.click( yearlyProductCheckbox );
		expect( anyProductCheckbox ).not.toBeChecked();
		expect( yearlyProductCheckbox ).not.toBeChecked();
		expect( monthlyProductCheckbox ).toBeChecked();

		// Unchecking monthly product leaves no products selected, meaning no products are limited, so all products are selected, including "Any product".
		await user.click( monthlyProductCheckbox );
		expect( anyProductCheckbox ).toBeChecked();
		expect( yearlyProductCheckbox ).toBeChecked();
		expect( monthlyProductCheckbox ).toBeChecked();

		// Clicking yearly product causes yearly product to be the only product selected again, deselecting other options.
		await user.click( yearlyProductCheckbox );
		expect( anyProductCheckbox ).not.toBeChecked();
		expect( yearlyProductCheckbox ).toBeChecked();
		expect( monthlyProductCheckbox ).not.toBeChecked();
	} );
} );
