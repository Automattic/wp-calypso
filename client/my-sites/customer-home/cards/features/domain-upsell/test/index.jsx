/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import DomainUpsell from '../';

jest.mock( 'calypso/state/ui/selectors', () => {
	return {
		getSelectedSite: () => {
			return {
				ID: 1,
				plan: 'free',
			};
		},
		getSelectedSiteSlug: () => 'example.wordpress.com',
	};
} );

jest.mock( 'calypso/state/sites/domains/selectors', () => {
	return {
		getDomainsBySiteId: () => {
			return [ 'example.wordpress.com' ];
		},
	};
} );

jest.mock( '@automattic/calypso-products', () => {
	return {
		isFreePlanProduct: () => true,
	};
} );

jest.mock( '@automattic/domain-picker/src', () => {
	return {
		useDomainSuggestions: () => {
			return {
				allDomainSuggestions: [
					{
						is_free: false,
						product_slug: 'mydomain.com',
					},
				],
			};
		},
	};
} );

jest.mock( 'calypso/state/current-user/selectors', () => ( {
	getCurrentUserId: jest.fn( () => 12 ),
	isUserLoggedIn: jest.fn( () => true ),
	isCurrentUserEmailVerified: jest.fn( () => true ),
} ) );

let pageLink = '';
jest.mock( 'page', () => ( link ) => ( pageLink = link ) );

describe( 'index', () => {
	describe( 'verification nudge', () => {
		test( 'Should show H3 content for the Home domain upsell and test search domain button link', async () => {
			const initialState = {};
			const mockStore = configureStore();
			const store = mockStore( initialState );

			const { container } = render(
				<Provider store={ store }>
					<DomainUpsell />
				</Provider>
			);

			const notice = container.querySelector( 'h3' );
			expect( notice ).toBeVisible();
			expect( notice ).toHaveTextContent( 'Own your online identity with a custom domain' );

			const links = [].slice.call( container.querySelectorAll( 'a' ) );
			expect(
				links.some( ( link ) =>
					link.href.endsWith( '/domains/add/example.wordpress.com?domainAndPlanPackage=true' )
				)
			).toBeTruthy();
		} );

		test( 'Should test the purchase button link', async () => {
			nock.cleanAll();
			nock( 'https://public-api.wordpress.com' )
				.persist()
				.post( '/rest/v1.1/me/shopping-cart/no-site' )
				.reply( 200 );

			const initialState = {};
			const mockStore = configureStore();
			const store = mockStore( initialState );

			const { getByText } = render(
				<Provider store={ store }>
					<DomainUpsell />
				</Provider>
			);

			const user = userEvent.setup();
			await user.click( getByText( 'Buy this domain' ) );
			expect( pageLink ).toBe( '/plans/yearly/example.wordpress.com?get_domain=example.blog' );
		} );
	} );
} );
