/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../test-utils';
import DomainUpsellCard from '../index';
import type { Site } from '@automattic/api-core';

const mockSiteId = 123;

const mockFetchSitePlans = jest.fn();
const mockFetchDomainSuggestions = jest.fn();
const mockReplaceProductsInCart = jest.fn();
const mockCreateErrorNotice = jest.fn();
let mockShoppingCartImportError: Error | null = null;

jest.mock( '@automattic/api-core', () => ( {
	...jest.requireActual( '@automattic/api-core' ),
	fetchSitePlans: ( ...args: unknown[] ) => mockFetchSitePlans( ...args ),
	fetchDomainSuggestions: ( ...args: unknown[] ) => mockFetchDomainSuggestions( ...args ),
} ) );

jest.mock( '../../../app/shopping-cart', () => {
	if ( mockShoppingCartImportError ) {
		throw mockShoppingCartImportError;
	}

	return {
		shoppingCartManagerClient: {
			forCartKey: () => ( {
				actions: {
					replaceProductsInCart: ( ...args: unknown[] ) => mockReplaceProductsInCart( ...args ),
				},
			} ),
		},
	};
} );

// eslint-disable-next-line no-restricted-imports
jest.mock( 'calypso/lib/domains', () => ( {
	getDomainAndPlanUpsellUrl: () => '/upsell-url',
} ) );

jest.mock( '@wordpress/data', () => ( {
	useDispatch: () => ( {
		createErrorNotice: mockCreateErrorNotice,
	} ),
	useSelect: jest.fn( () => ( {} ) ),
	combineReducers: jest.fn( ( reducers ) => reducers ),
	createReduxStore: jest.fn(),
	register: jest.fn(),
	createSelector: jest.fn(),
	keyedReducer: () => () => ( {} ),
} ) );

jest.mock( '@wordpress/i18n', () => ( {
	...jest.requireActual( '@wordpress/i18n' ),
	__: ( text: string ) => text,
} ) );

const mockSite: Site = {
	ID: mockSiteId,
	slug: 'example.wordpress.com',
	plan: {},
} as Site;

beforeEach( () => {
	jest.clearAllMocks();
	mockShoppingCartImportError = null;
	mockFetchSitePlans.mockResolvedValue( {
		plans: [ { current_plan: true, has_domain_credit: true } ],
	} );
	mockFetchDomainSuggestions.mockResolvedValue( [
		{ domain_name: 'example.com', product_slug: 'domain_reg' },
	] );
} );

describe( 'DomainUpsellCard', () => {
	test( 'shows an error notice when the shopping cart chunk fails to load', async () => {
		const user = userEvent.setup();
		mockShoppingCartImportError = new Error( 'Loading chunk failed' );

		render( <DomainUpsellCard site={ mockSite } /> );

		const button = await screen.findByRole( 'button', { name: 'Claim this domain' } );
		await user.click( button );

		await waitFor( () => {
			expect( mockCreateErrorNotice ).toHaveBeenCalledWith( 'Loading chunk failed', {
				type: 'snackbar',
			} );
		} );

		expect( button ).not.toHaveClass( 'is-busy' );
	} );

	test( 'shows an error notice when adding an unavailable domain to the cart fails', async () => {
		const user = userEvent.setup();
		const errorMessage = 'Sorry, the domain you are trying to add is no longer available.';
		mockReplaceProductsInCart.mockRejectedValue( new Error( errorMessage ) );

		render( <DomainUpsellCard site={ mockSite } /> );

		const button = await screen.findByRole( 'button', { name: 'Claim this domain' } );
		await user.click( button );

		await waitFor( () => {
			expect( mockCreateErrorNotice ).toHaveBeenCalledWith( errorMessage, { type: 'snackbar' } );
		} );

		// The button should no longer be busy after the failure.
		expect( button ).not.toHaveClass( 'is-busy' );
	} );
} );
