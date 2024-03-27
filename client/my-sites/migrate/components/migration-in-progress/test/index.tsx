/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import React, { ComponentProps } from 'react';
import { MigrationInProgress } from '../';

type Props = ComponentProps< typeof MigrationInProgress >;

describe( 'MigrationInProgress', () => {
	beforeAll( () => nock.disableNetConnect() );

	const renderComponent = ( props: Partial< Props > = {} ) => {
		const queryClient = new QueryClient();
		return render(
			<QueryClientProvider client={ queryClient }>
				<MigrationInProgress
					targetSite="new-site.wordpress.com"
					targetSiteId="some-site-id"
					sourceSite="source-site.external.com"
					onComplete={ jest.fn() }
					{ ...props }
				/>
			</QueryClientProvider>
		);
	};

	it( 'renders the destination site', () => {
		renderComponent();

		expect( screen.getByText( /new-site.wordpress.com/ ) ).toBeVisible();
	} );

	it( 'renders the source site', () => {
		renderComponent();

		expect( screen.getByText( /source-site.external.com/ ) ).toBeVisible();
	} );

	it( "renders 'your site' when the source site is not available", () => {
		renderComponent( { sourceSite: undefined } );

		expect( screen.getByText( /your source site/ ) ).toBeVisible();
	} );

	it( 'calls onComplete when migration is done', async () => {
		const onComplete = jest.fn();
		nock( 'https://public-api.wordpress.com:443' )
			.get( '/wpcom/v2/sites/some-site-id/migration-status' )
			.reply( 200, { status: 'done' } );

		renderComponent( { onComplete } );

		await waitFor( () => {
			expect( onComplete ).toHaveBeenCalled();
		} );
	} );
} );
