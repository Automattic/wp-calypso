/** @jest-environment jsdom */
// @ts-nocheck - TODO: Fix TypeScript issues

import { isEnabled } from '@automattic/calypso-config';
import { PLAN_FREE } from '@automattic/calypso-products';
import { useCurrentPlan } from '@automattic/data-stores/src/plans';
import { screen, within, act } from '@testing-library/react';
import React from 'react';
import PlansWrapper from 'calypso/my-sites/plans/main';
import purchasesReducer from 'calypso/state/purchases/reducer';
import uiReducer from 'calypso/state/ui/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';

jest.mock( '@automattic/calypso-config' );
jest.mock( 'calypso/components/data/document-head', () => () => null );
jest.mock( 'calypso/components/data/query-active-promotions', () => jest.fn() );
jest.mock( 'calypso/components/data/query-sites', () => jest.fn() );
jest.mock( 'calypso/components/data/query-site-purchases', () => jest.fn() );
jest.mock( 'calypso/components/data/query-products-list', () => jest.fn() );
jest.mock( '@automattic/data-stores/src/plans/hooks/use-current-plan', () => jest.fn() );

const mockPlan = {
	planSlug: PLAN_FREE,
	is_free: true,
};

const mockSite = {
	ID: 1,
	plan: mockPlan,
};

const initialState = {
	sites: {
		items: {
			[ mockSite.ID ]: {
				ID: mockSite.ID,
				slug: 'test-site',
				plan: mockPlan,
			},
		},
	},
	ui: {
		selectedSiteId: mockSite.ID,
	},
	currentUser: {
		capabilities: {
			[ mockSite.ID ]: {
				manage_options: true,
			},
		},
	},
};

describe( '/plans/:siteSlug', () => {
	let originalScrollTo;

	beforeAll( () => {
		originalScrollTo = window.scrollTo;
		window.scrollTo = () => null;
		window.IntersectionObserver = jest.fn( () => ( {
			observe: jest.fn(),
			unobserve: jest.fn(),
			disconnect: jest.fn(),
		} ) );
	} );

	afterAll( () => {
		window.scrollTo = originalScrollTo;
	} );

	const renderPage = ( { initialPath } = {} ) => {
		renderWithProvider( <PlansWrapper context={ { path: '/plans' } } />, {
			initialPath,
			initialState,
			reducers: {
				ui: uiReducer,
				purchases: purchasesReducer,
			},
		} );
	};

	beforeEach( () => {
		jest.clearAllMocks();

		const configMock = ( values ) => ( key ) => values[ key ];
		( isEnabled as jest.Mock ).mockImplementation( configMock( { 'untangling/plans': true } ) );

		( useCurrentPlan as jest.Mock ).mockReturnValue( mockPlan );
	} );

	describe( "'Manage add-ons' button", () => {
		beforeEach( renderPage );

		it( 'should be visible', () => {
			expect( screen.getByRole( 'button', { name: 'Manage add-ons' } ) ).toBeInTheDocument();
		} );

		it( 'should hide the modal initially', () => {
			expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
		} );

		describe( 'when the button is clicked', () => {
			beforeEach( () => {
				const button = screen.getByRole( 'button', { name: 'Manage add-ons' } );
				act( () => {
					button.click();
				} );
			} );

			it( 'should show the modal', () => {
				const dialog = screen.getByRole( 'dialog' );
				expect( dialog ).toBeInTheDocument();
				expect( within( dialog ).getByRole( 'heading' ) ).toHaveTextContent(
					'Boost your plan with add-ons'
				);
			} );
		} );
	} );

	describe( "when the '?add-ons-modal=true' query param is present", () => {
		beforeEach( () => {
			renderPage( { initialPath: '?add-ons-modal=true' } );
		} );

		it( 'should show the add-ons modal initially', () => {
			const dialog = screen.getByRole( 'dialog' );
			expect( dialog ).toBeInTheDocument();
			expect( within( dialog ).getByRole( 'heading' ) ).toHaveTextContent(
				'Boost your plan with add-ons'
			);
		} );
	} );
} );
