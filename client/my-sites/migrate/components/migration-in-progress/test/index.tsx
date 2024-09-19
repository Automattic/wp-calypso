/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, waitFor } from '@testing-library/react';
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
				<MigrationInProgress targetSiteId={ 123 } onComplete={ jest.fn() } { ...props } />
			</QueryClientProvider>
		);
	};

	it( 'calls onComplete when migration is done', async () => {
		const onComplete = jest.fn();
		nock( 'https://public-api.wordpress.com:443' )
			.get( '/wpcom/v2/sites/123/migration-status' )
			.reply( 200, { status: 'done' } );

		renderComponent( { onComplete } );

		await waitFor( () => {
			expect( onComplete ).toHaveBeenCalled();
		} );
	} );
} );
