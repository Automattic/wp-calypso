/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import ThemeQueryManager from 'calypso/lib/query-manager/theme';
import QueryCanonicalTheme from '..';

jest.mock( 'calypso/components/data/query-theme', () => ( { siteId, themeId } ) => (
	<div data-testid="query-theme" data-site-id={ siteId } data-theme-id={ themeId } />
) );

const mockStore = configureStore();

const retiredThemeQueries = {
	wpcom: new ThemeQueryManager( {
		items: {
			'retired-theme': {
				id: 'retired-theme',
				retired: true,
			},
		},
	} ),
};

const renderWithState = ( state, themeId ) => {
	render(
		<Provider store={ mockStore( state ) }>
			<QueryCanonicalTheme siteId={ 2916284 } themeId={ themeId } />
		</Provider>
	);
	return screen.getAllByTestId( 'query-theme' ).map( ( element ) => element.dataset.siteId );
};

describe( 'QueryCanonicalTheme', () => {
	test( 'queries the site theme for a WP.com theme on a Jetpack or Atomic site', () => {
		const queriedSites = renderWithState(
			{
				sites: { items: { 2916284: { ID: 2916284, jetpack: true } } },
				themes: { queries: retiredThemeQueries },
			},
			'retired-theme'
		);

		expect( queriedSites ).toEqual( [ 'wpcom', '2916284' ] );
	} );

	test( 'does not query the site theme for a WP.com theme on a Simple site', () => {
		const queriedSites = renderWithState(
			{
				sites: { items: { 2916284: { ID: 2916284, jetpack: false } } },
				themes: { queries: retiredThemeQueries },
			},
			'retired-theme'
		);

		expect( queriedSites ).toEqual( [ 'wpcom' ] );
	} );

	test( 'still falls back to the site theme when neither WP.com nor WP.org has it', () => {
		const queriedSites = renderWithState(
			{
				sites: { items: { 2916284: { ID: 2916284, jetpack: false } } },
				themes: { queries: {} },
			},
			'unknown-theme'
		);

		expect( queriedSites ).toEqual( [ 'wpcom', 'wporg', '2916284' ] );
	} );
} );
