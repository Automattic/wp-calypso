/*
 * @jest-environment jsdom
 */
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { useSelector } from 'calypso/state';
import { getPostByKey } from 'calypso/state/reader/posts/selectors';
import reader from 'calypso/state/reader/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { QueryReaderPost } from '../index';

const TestComponent = () => {
	const post = useSelector( ( state ) => getPostByKey( state, { blogId: 1, postId: 1 } ) );
	return (
		<>
			{ post?.title }
			{ post?.error?.message }
		</>
	);
};

const initialState = {
	reader: {
		posts: {
			items: {},
		},
	},
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

describe( 'QueryReaderPost', () => {
	beforeAll( () => {
		nock.disableNetConnect();
	} );

	beforeEach( () => {
		nock.cleanAll();
	} );

	it( 'fills the redux store with the post', async () => {
		nock.disableNetConnect();
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/read/sites/1/posts/1' )
			.query( true )
			.reply( 200, { ID: 1, site_ID: 1, global_ID: '1', title: 'Test post' } );

		renderWithProvider(
			<>
				<QueryReaderPost postKey={ { blogId: 1, postId: 1 } } />
				<TestComponent />
			</>,
			{ queryClient: getQueryClient(), initialState, reducers: { reader } }
		);

		await waitFor( () => {
			expect( screen.getByText( 'Test post' ) ).toBeInTheDocument();
		} );
	} );

	it( 'fills the redux store with the post error', async () => {
		nock.disableNetConnect();
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/read/sites/1/posts/1' )
			.query( true )
			.reply( 404, { message: 'Post not found' } );

		renderWithProvider(
			<>
				<QueryReaderPost postKey={ { blogId: 1, postId: 1 } } />
				<TestComponent />
			</>,
			{ queryClient: getQueryClient(), initialState, reducers: { reader } }
		);

		await waitFor( () => {
			expect( screen.getByText( 'Post not found' ) ).toBeInTheDocument();
		} );
	} );
} );
