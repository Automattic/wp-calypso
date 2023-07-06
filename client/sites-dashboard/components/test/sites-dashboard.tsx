/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import React from 'react';
import documentHead from 'calypso/state/document-head/reducer';
import preferences from 'calypso/state/preferences/reducer';
import purchases from 'calypso/state/purchases/reducer';
import { reducer as ui } from 'calypso/state/ui/reducer';
import userSettings from 'calypso/state/user-settings/reducer';
import { renderWithProvider } from '../../../test-helpers/testing-library';
import { SitesDashboard } from '../sites-dashboard';

const render = ( el ) =>
	renderWithProvider( el, {
		initialState: {
			preferences: {
				remoteValues: {
					'sites-sorting': 'alphabetically-asc',
					'sites-management-dashboard-display-mode': 'tile',
				},
			},
		},
		reducers: { documentHead, preferences, purchases, ui, userSettings },
	} as any );

// react-intersection-observer tries to instantiate an `IntersectionObserver`
jest.mock( 'react-intersection-observer', () => ( {
	useInView: () => ( { ref: { current: null }, inView: true } ),
} ) );

const mockFetchSites = () =>
	nock( 'https://public-api.wordpress.com' ).get( '/rest/v1.2/me/sites' );

describe( '<SitesDashboard>', () => {
	test( 'renders dashboard links for each site', async () => {
		mockFetchSites()
			.query( true ) // Match any query parameters
			.reply( 200, {
				sites: [
					{ ID: 123, URL: 'http://example1.com', name: 'Example 1' },
					{ ID: 321, URL: 'http://example2.com', name: 'Example 2' },
				],
			} );

		render( <SitesDashboard queryParams={ {} } /> );

		await waitFor( () => {
			expect( screen.getByText( 'Example 1' ) ).toHaveAttribute( 'href', '/home/example1.com' );
			expect( screen.getByText( 'Example 2' ) ).toHaveAttribute( 'href', '/home/example2.com' );
		} );
	} );

	test( 'domain-only sites are not displayed', async () => {
		mockFetchSites()
			.query( true ) // Match any query parameters
			.reply( 200, {
				sites: [
					{
						ID: 123,
						URL: 'http://example1.com',
						name: 'Example 1',
						options: { is_domain_only: false },
					},
					{
						ID: 321,
						URL: 'http://example2.com',
						name: 'Example 2',
						options: { is_domain_only: true },
					},
				],
			} );

		render( <SitesDashboard queryParams={ {} } /> );

		await waitFor( () => {
			expect( screen.getByText( 'Example 1' ) ).toHaveAttribute( 'href', '/home/example1.com' );
			expect( screen.queryByText( 'Example 2' ) ).not.toBeInTheDocument();
		} );
	} );
} );
