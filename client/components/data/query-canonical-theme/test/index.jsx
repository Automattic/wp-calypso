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

describe( 'QueryCanonicalTheme', () => {
	test( 'queries the site theme when the WP.com theme is retired', () => {
		const store = mockStore( {
			themes: {
				queries: {
					wpcom: new ThemeQueryManager( {
						items: {
							'retired-theme': {
								id: 'retired-theme',
								retired: true,
							},
						},
					} ),
				},
			},
		} );

		render(
			<Provider store={ store }>
				<QueryCanonicalTheme siteId={ 2916284 } themeId="retired-theme" />
			</Provider>
		);

		expect( screen.getAllByTestId( 'query-theme' ).map( ( element ) => element.dataset ) ).toEqual(
			expect.arrayContaining( [
				expect.objectContaining( {
					siteId: 'wpcom',
					themeId: 'retired-theme',
				} ),
				expect.objectContaining( {
					siteId: '2916284',
					themeId: 'retired-theme',
				} ),
			] )
		);
	} );
} );
