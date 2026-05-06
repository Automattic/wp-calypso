/*
 * @jest-environment jsdom
 */
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { withReaderRelatedPosts, WithReaderRelatedPostsInjectedProps } from '../index';

const mockPosts = [
	{ ID: 11, site_ID: 1, global_ID: 'g11' },
	{ ID: 12, site_ID: 1, global_ID: 'g12' },
];

const TestComponent = ( { posts }: WithReaderRelatedPostsInjectedProps ) => {
	if ( ! posts ) {
		return <div>loading</div>;
	}
	return <>{ posts.join( ',' ) }</>;
};

const SameSite = withReaderRelatedPosts( 'same' )( TestComponent );

const getQueryClient = () => {
	const instance = new QueryClient();
	instance.setDefaultOptions( { queries: { retry: false } } );
	return instance;
};

describe( 'withReaderRelatedPosts', () => {
	beforeAll( () => {
		nock.disableNetConnect();
	} );

	beforeEach( () => {
		nock.cleanAll();
	} );

	it( 'injects posts as global_ID strings on the wrapped component', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.2/read/site/1/post/2/related' )
			.query( true )
			.reply( 200, { posts: mockPosts } );

		renderWithProvider( <SameSite siteId={ 1 } postId={ 2 } />, {
			queryClient: getQueryClient(),
		} );

		await waitFor( () => {
			expect( screen.getByText( 'g11,g12' ) ).toBeVisible();
		} );
	} );

	it( 'renders nothing when the request fails', async () => {
		const scope = nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.2/read/site/1/post/2/related' )
			.query( true )
			.reply( 500, { message: 'Internal Server Error' } );

		const { container } = renderWithProvider( <SameSite siteId={ 1 } postId={ 2 } />, {
			queryClient: getQueryClient(),
		} );

		await waitFor( () => expect( scope.isDone() ).toBe( true ) );
		await waitFor( () => expect( container ).toBeEmptyDOMElement() );
	} );
} );
