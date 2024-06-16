/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import React from 'react';
import { MemoryRouter } from 'react-router';
import documentHead from 'calypso/state/document-head/reducer';
import uiReducer from 'calypso/state/ui/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { UrlData } from '../../../../blocks/import/types';
import SiteMigrationFlow from '../site-migration-flow';

const render = () => {
	return renderWithProvider(
		<MemoryRouter
			basename="setup"
			initialEntries={ [
				'/setup/site-migration/site-migration-identify?from=https%3A%2F%2Faliceterapeuta.com%2F&siteSlug=sitemigration7.wordpress.com&siteId=231781379',
			] }
		>
			<SiteMigrationFlow />
		</MemoryRouter>,
		{
			reducers: {
				documentHead,
				ui: uiReducer,
			},
			initialState: {
				documentHead: {
					title: 'Site Migration',
				},
			},
		}
	);
};

const API_RESPONSE_WORDPRESS_PLATFORM: UrlData = {
	url: 'https://example.com',
	platform: 'wordpress',
	meta: {
		title: 'Site Title',
		favicon: 'https://example.com/favicon.ico',
	},
};

describe( 'Integration: Site Migration Flow', () => {
	beforeAll( () => {
		window.scrollTo = jest.fn();
		nock.disableNetConnect();
	} );

	it( 'navigate through the steps', async () => {
		// TODO: Explore to use MSW

		nock( 'https://public-api.wordpress.com:443' )
			.get( '/wpcom/v2/imports/analyze-url' )
			.query( { site_url: 'https://example.com' } )
			.reply( 200, API_RESPONSE_WORDPRESS_PLATFORM );

		render();

		await userEvent.type(
			await screen.findByLabelText( 'Enter your site address:' ),
			'https://example.com'
		);

		await userEvent.click( await screen.findByRole( 'button', { name: 'Check my site' } ) );

		await waitFor( () => {
			expect( screen.getByText( 'What do you want to migrate?' ) ).toBeInTheDocument();
		} );
	} );
} );
