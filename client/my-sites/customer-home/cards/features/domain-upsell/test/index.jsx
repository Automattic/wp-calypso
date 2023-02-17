/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import DomainUpsell from '../';

const sites = [];
sites[ 1 ] = {
	ID: 1,
	URL: 'example.wordpress.com',
	plan: {
		product_slug: 'free_plan',
	},
};

const initialState = {
	sites: {
		items: sites,
		domains: {
			items: [ 'example.wordpress.com' ],
		},
	},
	ui: {
		selectedSiteId: 1,
	},
	currentUser: {
		id: 12,
		user: {
			email_verified: true,
		},
	},
};

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

let pageLink = '';
jest.mock( 'page', () => ( link ) => ( pageLink = link ) );

describe( 'index', () => {
	test( 'Should show H3 content for the Home domain upsell and test search domain button link', async () => {
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
			.post( '/rest/v1.1/me/shopping-cart/1' )
			.reply( 200 );

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
