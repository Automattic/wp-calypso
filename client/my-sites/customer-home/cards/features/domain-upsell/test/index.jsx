/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
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

jest.mock( 'calypso/state/current-user/selectors', () => ( {
	getCurrentUserId: jest.fn( () => 12 ),
	isUserLoggedIn: jest.fn( () => true ),
	isCurrentUserEmailVerified: jest.fn( () => true ),
} ) );

describe( 'index', () => {
	describe( 'verification nudge', () => {
		test( 'Should show H3 content for the Home domain upsell and the correct /domains/add link', () => {
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
	} );
} );
