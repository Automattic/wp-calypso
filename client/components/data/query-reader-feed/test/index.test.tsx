/*
 * @jest-environment jsdom
 */
import { ReadFeedItem } from '@automattic/api-core';
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { useSelector } from 'calypso/state';
import { getFeed } from 'calypso/state/reader/feeds/selectors';
import reader from 'calypso/state/reader/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import QueryReaderFeed from '../index';

const feedId = 123;

const TestComponent = () => {
	const feed = useSelector( ( state ) => getFeed( state, feedId ) ) as ReadFeedItem | null;
	if ( ! feed ) {
		return null;
	}

	if ( feed?.is_error ) {
		return <>{ feed?.error?.message }</>;
	}

	return <>{ 'name' in feed ? feed?.name : '' }</>;
};

const getQueryClient = () => {
	const instance = new QueryClient();
	instance.setDefaultOptions( {
		queries: {
			retry: false,
		},
	} );
	return instance;
};

describe( 'QueryReaderFeed', () => {
	beforeAll( () => {
		nock.disableNetConnect();
	} );

	beforeEach( () => {
		nock.cleanAll();
	} );

	it( 'fills the redux store with the feed', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/read/feed/123' )
			.reply( 200, { feed_ID: 123, name: 'Test feed', blog_ID: 1 } );

		renderWithProvider(
			<>
				<QueryReaderFeed feedId={ feedId } />
				<TestComponent />
			</>,
			{ queryClient: getQueryClient(), reducers: { reader } }
		);

		await waitFor( () => {
			expect( screen.getByText( 'Test feed' ) ).toBeInTheDocument();
		} );
	} );

	it( 'fills the redux store with the feed error', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/read/feed/123' )
			.reply( 404, { message: 'Feed not found' } );

		renderWithProvider(
			<>
				<QueryReaderFeed feedId={ feedId } />
				<TestComponent />
			</>,
			{ queryClient: getQueryClient(), reducers: { reader } }
		);

		await waitFor( () => {
			expect( screen.getByText( 'Feed not found' ) ).toBeInTheDocument();
		} );
	} );
} );
