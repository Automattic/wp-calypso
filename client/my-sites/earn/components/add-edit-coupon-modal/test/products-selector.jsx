/**
 * @jest-environment jsdom
 */

const mockUseTranslate = () => ( text ) => text;
const mockTranslate = ( text ) => text;

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
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import ProductsSelector from '../products-selector';

const testProduct1 = {
	ID: 9,
	currency: 'USD',
	price: 5,
	title: 'Monthly Subscription',
	interval: '1 month',
	buyer_can_change_amount: false,
	multiple_per_user: false,
	welcome_email_content: 'Welcome!',
	subscribe_as_site_subscriber: true,
	renewal_schedule: '1 month',
	type: 'newsletter',
	is_editable: false,
};

const testProduct2 = {
	ID: 10,
	currency: 'USD',
	price: 40,
	title: 'Yearly Subscription',
	interval: '1 year',
	buyer_can_change_amount: false,
	multiple_per_user: false,
	welcome_email_content: 'Welcome!',
	subscribe_as_site_subscriber: true,
	renewal_schedule: '1 year',
	type: 'newsletter',
	is_editable: false,
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

function WrappedProductsSelector( props ) {
	const mockStore = configureStore();
	const store = mockStore( initialState );

	return (
		<Provider store={ store }>
			<ProductsSelector { ...props } />
		</Provider>
	);
}

describe( 'ProductsSelector', () => {
	beforeEach( () => {
		jest.clearAllMocks();

		useTranslate.mockImplementation( mockUseTranslate );
		translate.mockImplementation( mockTranslate );
		__.mockImplementation( mockTranslate );
	} );

	test( 'should render with any product selected when no specific products have been selected', () => {
		let editedPlanIdsAllowList = [];
		const setEditedPlanIdsAllowList = ( list ) => {
			editedPlanIdsAllowList = list;
		};
		const { container } = render(
			<WrappedProductsSelector
				onSelectedPlanIdsChange={ ( list ) => setEditedPlanIdsAllowList( list ) }
				initialSelectedList={ editedPlanIdsAllowList }
				allowMultiple={ true }
			/>
		);
		expect( container ).toMatchSnapshot();
	} );

	test( 'should render with 1 product selected when 1 product has been selected', () => {
		let editedPlanIdsAllowList = [ testProduct1.ID ];
		const setEditedPlanIdsAllowList = ( list ) => {
			editedPlanIdsAllowList = list;
		};
		const { container } = render(
			<WrappedProductsSelector
				onSelectedPlanIdsChange={ ( list ) => setEditedPlanIdsAllowList( list ) }
				initialSelectedList={ editedPlanIdsAllowList }
				allowMultiple={ true }
			/>
		);
		expect( container ).toMatchSnapshot();
	} );

	test( 'should render with 2 products selected when 2 products have been selected', () => {
		let editedPlanIdsAllowList = [ testProduct1.ID, testProduct2.ID ];
		const setEditedPlanIdsAllowList = ( list ) => {
			editedPlanIdsAllowList = list;
		};
		const { container } = render(
			<WrappedProductsSelector
				onSelectedPlanIdsChange={ ( list ) => setEditedPlanIdsAllowList( list ) }
				initialSelectedList={ editedPlanIdsAllowList }
				allowMultiple={ true }
			/>
		);
		expect( container ).toMatchSnapshot();
	} );

	test( 'clicking the button should show a dropdown with selected items selected', () => {
		let editedPlanIdsAllowList = [ testProduct1.ID, testProduct2.ID ];
		const setEditedPlanIdsAllowList = ( list ) => {
			editedPlanIdsAllowList = list;
		};
		render(
			<WrappedProductsSelector
				onSelectedPlanIdsChange={ ( list ) => setEditedPlanIdsAllowList( list ) }
				initialSelectedList={ editedPlanIdsAllowList }
				allowMultiple={ true }
			/>
		);

		expect( document.body ).toMatchSnapshot();

		act( () => screen.getByRole( 'button', { name: '2 products selected.' } ).click() );

		expect( screen.getByRole( 'menuitemcheckbox', { name: 'Any product' } ) ).not.toBeChecked();
		expect(
			screen.getByRole( 'menuitemcheckbox', { name: 'Yearly Subscription : $40.00 / year' } )
		).toBeChecked();
		expect(
			screen.getByRole( 'menuitemcheckbox', { name: 'Monthly Subscription : $5.00 / month' } )
		).toBeChecked();

		act( () =>
			screen
				.getByRole( 'menuitemcheckbox', { name: 'Yearly Subscription : $40.00 / year' } )
				.click()
		);
		expect(
			screen.getByRole( 'menuitemcheckbox', { name: 'Yearly Subscription : $40.00 / year' } )
		).not.toBeChecked();

		act( () =>
			screen
				.getByRole( 'menuitemcheckbox', { name: 'Monthly Subscription : $5.00 / month' } )
				.click()
		);
		expect( screen.getByRole( 'menuitemcheckbox', { name: 'Any product' } ) ).toBeChecked();
		expect(
			screen.getByRole( 'menuitemcheckbox', { name: 'Yearly Subscription : $40.00 / year' } )
		).toBeChecked();
		expect(
			screen.getByRole( 'menuitemcheckbox', { name: 'Monthly Subscription : $5.00 / month' } )
		).toBeChecked();
	} );
} );
