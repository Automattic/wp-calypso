/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import { translate } from 'i18n-calypso';
import purchases from 'calypso/state/purchases/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { SearchPurchase } from '../search';

jest.mock(
	'calypso/jetpack-connect/main-wrapper',
	() =>
		( { children } ) =>
			children
);
jest.mock( 'calypso/jetpack-connect/main-header', () => () => null );

describe( 'SearchPurchase', () => {
	afterEach( () => {
		window.history.replaceState( null, '', '/' );
	} );

	test( 'warns about renewing when the site already has the Search product being purchased', () => {
		window.history.replaceState( null, '', '/jetpack/connect/jetpack_search' );
		const site = {
			URL: 'https://example.com',
			jetpack: true,
			plan: { product_slug: 'jetpack_free' },
			products: [ { product_slug: 'jetpack_search', expired: false, user_is_owner: true } ],
		};
		renderWithProvider(
			<SearchPurchase
				translate={ translate }
				url="https://example.com"
				status=""
				getJetpackSiteByUrl={ () => site }
				getSiteByUrl={ () => site }
				renderNotices={ () => null }
				renderFooter={ () => null }
				processJpSite={ () => {} }
				searchSites={ () => [] }
				checkUrl={ () => {} }
				recordTracksEvent={ () => {} }
			/>,
			{ reducers: { purchases } }
		);

		expect(
			screen.getByText(
				/This site already has a Jetpack Search subscription\. Continuing will renew it\./
			)
		).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Manage subscriptions' } ) ).toHaveAttribute(
			'href',
			'/purchases/subscriptions/example.com'
		);
	} );
} );
